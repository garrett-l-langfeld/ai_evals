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
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
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
  return evalKitSchema.parse(JSON.parse(parsedText));
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

      return evalKitSchema.parse(result.object);
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
