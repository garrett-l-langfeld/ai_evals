import { generateObject, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createXai } from "@ai-sdk/xai";
import { buildMockEvalKit } from "@/lib/mock-generator";
import { buildGeneratorPrompt } from "@/lib/prompt";
import { evalKitSchema, generationSettingsSchema, workflowInputSchema } from "@/lib/schemas";
import type { EvalKit, GenerationProvider, GenerationSettings, WorkflowInput } from "@/types/eval-kit";

type GeneratedPayload = {
  evalKit: EvalKit;
  provider: GenerationProvider;
  model: string;
};

class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

class ProviderGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderGenerationError";
  }
}

function cleanOptional(value?: string) {
  return value?.trim() || undefined;
}

export function normalizeWorkflowInput(input: WorkflowInput): WorkflowInput {
  const parsed = workflowInputSchema.parse(input);

  return {
    workflowName: parsed.workflowName.trim(),
    workflowDescription: parsed.workflowDescription.trim(),
    userType: cleanOptional(parsed.userType),
    inputType: cleanOptional(parsed.inputType),
    outputType: cleanOptional(parsed.outputType),
    businessGoal: cleanOptional(parsed.businessGoal),
    constraints: cleanOptional(parsed.constraints),
    edgeCases: cleanOptional(parsed.edgeCases)
  };
}

export function normalizeGenerationSettings(settings: GenerationSettings): GenerationSettings {
  const parsed = generationSettingsSchema.parse(settings);

  return {
    provider: parsed.provider,
    model: parsed.provider === "mock" ? "deterministic-template" : parsed.model.trim()
  };
}

function requiredEnv(name: string, message: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ProviderConfigurationError(message);
  }

  return value;
}

function getLanguageModel(settings: GenerationSettings) {
  switch (settings.provider) {
    case "openai": {
      const apiKey = requiredEnv(
        "OPENAI_API_KEY",
        "OpenAI is selected, but OPENAI_API_KEY is missing from .env.local."
      );
      return createOpenAI({ apiKey }).chat(settings.model);
    }
    case "xai": {
      const apiKey = requiredEnv(
        "XAI_API_KEY",
        "xAI is selected, but XAI_API_KEY is missing from .env.local."
      );
      return createXai({ apiKey }).chat(settings.model);
    }
    case "openai-compatible": {
      const apiKey = requiredEnv(
        "COMPATIBLE_API_KEY",
        "OpenAI-compatible mode is selected, but COMPATIBLE_API_KEY is missing from .env.local."
      );
      const baseURL = requiredEnv(
        "COMPATIBLE_BASE_URL",
        "OpenAI-compatible mode is selected, but COMPATIBLE_BASE_URL is missing from .env.local."
      );
      const providerName = process.env.COMPATIBLE_PROVIDER_NAME?.trim() || "compatible";
      const supportsStructuredOutputs = process.env.COMPATIBLE_SUPPORTS_STRUCTURED_OUTPUTS === "true";

      return createOpenAICompatible({
        name: providerName,
        apiKey,
        baseURL,
        supportsStructuredOutputs
      })(settings.model);
    }
    default: {
      throw new ProviderConfigurationError(`Unsupported provider: ${settings.provider}`);
    }
  }
}

function extractJsonObject(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  if (firstBrace < 0) {
    return text.trim();
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = firstBrace; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(firstBrace, index + 1).trim();
      }
    }
  }

  return text.slice(firstBrace).trim();
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (item == null) {
          return [];
        }

        return String(item).trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  if (value == null) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => toText(item))
      .filter(Boolean);

    if (normalized.length > 0) {
      return normalized;
    }
  }

  if (typeof value === "string") {
    const normalized = value
      .split(/\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return fallback;
}

function repairEvalKit(candidate: unknown, input: WorkflowInput): EvalKit {
  const fallback = buildMockEvalKit(input);
  const source = typeof candidate === "object" && candidate !== null ? (candidate as Record<string, unknown>) : {};
  const workflowSummarySource =
    typeof source.workflowSummary === "object" && source.workflowSummary !== null
      ? (source.workflowSummary as Record<string, unknown>)
      : {};

  const testCaseSource = Array.isArray(source.testCases) ? source.testCases : [];
  const rubricSource = Array.isArray(source.graderRubric) ? source.graderRubric : [];
  const schemaSource =
    typeof source.evalDatasetSchema === "object" && source.evalDatasetSchema !== null
      ? (source.evalDatasetSchema as Record<string, unknown>)
      : {};

  const repairedTestCases = [
    ...testCaseSource.map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      const backup = fallback.testCases[index % fallback.testCases.length];

      return {
        id: `TC-${index + 1}`,
        title: toText(record.title, backup.title),
        scenario: toText(record.scenario, backup.scenario),
        sampleInput: toText(record.sampleInput, backup.sampleInput),
        expectedBehavior: toText(record.expectedBehavior, backup.expectedBehavior),
        primaryRisk: toText(record.primaryRisk, backup.primaryRisk)
      };
    }),
    ...fallback.testCases
  ].slice(0, 12);

  const repairedRubric = [
    ...rubricSource.map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      const backup = fallback.graderRubric[index % fallback.graderRubric.length];

      return {
        name: toText(record.name, backup.name),
        description: toText(record.description, backup.description),
        scaleMin:
          typeof record.scaleMin === "number" && Number.isFinite(record.scaleMin) ? record.scaleMin : backup.scaleMin,
        scaleMax:
          typeof record.scaleMax === "number" && Number.isFinite(record.scaleMax) ? record.scaleMax : backup.scaleMax,
        highScoreMeaning: toText(record.highScoreMeaning, backup.highScoreMeaning),
        lowScoreMeaning: toText(record.lowScoreMeaning, backup.lowScoreMeaning)
      };
    }),
    ...fallback.graderRubric
  ].slice(0, 6);

  const repaired: EvalKit = {
    workflowSummary: {
      summary: toText(workflowSummarySource.summary, fallback.workflowSummary.summary),
      inputAssumptions: toStringArray(
        workflowSummarySource.inputAssumptions,
        fallback.workflowSummary.inputAssumptions
      ),
      outputAssumptions: toStringArray(
        workflowSummarySource.outputAssumptions,
        fallback.workflowSummary.outputAssumptions
      ),
      evalFocus: toStringArray(workflowSummarySource.evalFocus, fallback.workflowSummary.evalFocus)
    },
    successCriteria: toStringArray(source.successCriteria, fallback.successCriteria).slice(0, 8),
    failureModes: toStringArray(source.failureModes, fallback.failureModes).slice(0, 10),
    testCases: repairedTestCases,
    graderRubric: repairedRubric,
    evalDatasetSchema: {
      type: toText(schemaSource.type, fallback.evalDatasetSchema.type),
      properties:
        typeof schemaSource.properties === "object" && schemaSource.properties !== null
          ? (schemaSource.properties as Record<string, unknown>)
          : fallback.evalDatasetSchema.properties,
      required: toStringArray(schemaSource.required, fallback.evalDatasetSchema.required)
    }
  };

  if (repaired.successCriteria.length < 5) {
    repaired.successCriteria = fallback.successCriteria;
  }

  if (repaired.failureModes.length < 6) {
    repaired.failureModes = fallback.failureModes;
  }

  if (repaired.testCases.length < 8) {
    repaired.testCases = fallback.testCases;
  }

  if (repaired.graderRubric.length < 4) {
    repaired.graderRubric = fallback.graderRubric;
  }

  repaired.testCases = repaired.testCases.map((testCase, index) => ({
    ...testCase,
    id: `TC-${index + 1}`
  }));

  return evalKitSchema.parse(repaired);
}

async function generateWithPromptedJson(input: WorkflowInput, settings: GenerationSettings): Promise<EvalKit> {
  const model = getLanguageModel(settings);
  const result = await generateText({
    model,
    maxRetries: 0,
    system:
      "You are an expert AI evaluation designer. Return JSON only. No markdown, no code fences, no commentary, and no extra fields outside the requested schema.",
    prompt: buildGeneratorPrompt(input)
  });

  const parsedText = extractJsonObject(result.text);
  return repairEvalKit(JSON.parse(parsedText), input);
}

async function generateWithProvider(input: WorkflowInput, settings: GenerationSettings): Promise<EvalKit> {
  try {
    if (settings.provider === "openai") {
      const model = getLanguageModel(settings);
      const result = await generateObject({
        model,
        maxRetries: 0,
        schema: evalKitSchema,
        schemaName: "eval_kit",
        schemaDescription: "A concise, practical starter evaluation kit for an AI workflow.",
        system:
          "You are an expert AI evaluation designer. Return concise, realistic, operationally useful JSON that matches the schema exactly.",
        prompt: buildGeneratorPrompt(input)
      });

      return repairEvalKit(result.object, input);
    }

    return await generateWithPromptedJson(input, settings);
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown provider error.";
    throw new ProviderGenerationError(message);
  }
}

export async function generateEvalKit(
  input: WorkflowInput,
  generation: GenerationSettings
): Promise<GeneratedPayload> {
  const normalizedInput = normalizeWorkflowInput(input);
  const normalizedGeneration = normalizeGenerationSettings(generation);

  if (normalizedGeneration.provider === "mock") {
    return {
      evalKit: buildMockEvalKit(normalizedInput),
      provider: normalizedGeneration.provider,
      model: normalizedGeneration.model
    };
  }

  return {
    evalKit: await generateWithProvider(normalizedInput, normalizedGeneration),
    provider: normalizedGeneration.provider,
    model: normalizedGeneration.model
  };
}

export function getGeneratorErrorMessage(error: unknown): string {
  if (error instanceof ProviderConfigurationError) {
    return error.message;
  }

  if (error instanceof ProviderGenerationError) {
    return `Generation failed: ${error.message}`;
  }

  return "We couldn't generate an eval kit right now. Please retry.";
}
