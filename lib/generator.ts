import { evalKitSchema, workflowInputSchema } from "@/lib/schemas";
import { buildGeneratorPrompt } from "@/lib/prompt";
import type { EvalKit, WorkflowInput } from "@/types/eval-kit";

type GeneratorMode = "mock" | "openai";

type GeneratedPayload = {
  evalKit: EvalKit;
  mode: GeneratorMode;
};

class OpenAIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigurationError";
  }
}

class OpenAIGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIGenerationError";
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

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function choose<T>(items: T[], seed: number, offset: number): T {
  return items[(seed + offset) % items.length];
}

function buildDatasetSchema(workflowName: string) {
  return {
    type: "object",
    properties: {
      id: { type: "string", description: "Unique eval example identifier" },
      workflow_name: { type: "string", const: workflowName },
      input: { type: "object", description: "Original workflow input to evaluate" },
      expected_output: { type: "object", description: "Human-authored expected behavior or answer" },
      risk_tags: {
        type: "array",
        items: { type: "string" },
        description: "Failure risks this example targets"
      },
      grader_notes: { type: "string", description: "Reviewer notes or evaluation hints" },
      score_dimensions: {
        type: "object",
        additionalProperties: { type: "number" },
        description: "Per-dimension rubric scores"
      }
    },
    required: [
      "id",
      "workflow_name",
      "input",
      "expected_output",
      "risk_tags",
      "grader_notes",
      "score_dimensions"
    ]
  };
}

function buildMockEvalKit(input: WorkflowInput): EvalKit {
  const seed = hashString(`${input.workflowName}:${input.workflowDescription}`);
  const subject = input.workflowName.toLowerCase();
  const inputType = input.inputType || "user-provided source material";
  const outputType = input.outputType || "structured workflow output";
  const userType = input.userType || "operator";
  const businessGoal = input.businessGoal || `deliver reliable ${subject} outputs`;
  const constraint = input.constraints || "avoid unsupported claims and preserve key details";
  const edgeCases = input.edgeCases || "ambiguous or incomplete requests";

  const successCriteriaPool = [
    `Captures the most decision-relevant facts for the ${userType}.`,
    `Produces ${outputType.toLowerCase()} in a consistent, scannable structure.`,
    "Avoids unsupported claims or fabricated specifics.",
    "Handles uncertainty explicitly instead of hiding ambiguity.",
    `Respects operational constraints such as ${constraint.toLowerCase()}.`,
    `Preserves important context from the ${inputType.toLowerCase()}.`,
    `Keeps output concise enough to support the business goal of ${businessGoal.toLowerCase()}.`,
    "Flags missing information when confidence should be reduced."
  ];

  const failureModePool = [
    "Hallucinates details that are not grounded in the source material.",
    "Omits a critical fact needed for downstream action.",
    "Uses the wrong label, priority, or category.",
    "Ignores a user or business constraint when summarizing.",
    "Presents uncertain conclusions with unjustified confidence.",
    "Over-compresses the output and drops actionable nuance.",
    `Performs poorly on edge cases such as ${edgeCases.toLowerCase()}.`,
    "Fails to separate observed facts from inferred suggestions.",
    "Returns the right facts in the wrong format for the operator workflow.",
    "Treats noisy or adversarial input as trustworthy without qualification."
  ];

  const scenarioPool = [
    {
      title: "Typical high-signal request",
      scenario: "A standard example with clear source material and one dominant task.",
      risk: "Baseline quality"
    },
    {
      title: "Multiple competing issues",
      scenario: "The input contains two legitimate topics and the system must prioritize correctly.",
      risk: "Omission of critical context"
    },
    {
      title: "Ambiguous source material",
      scenario: "The evidence is mixed or incomplete, requiring uncertainty handling.",
      risk: "Overconfidence under ambiguity"
    },
    {
      title: "Missing key field",
      scenario: "One expected detail is absent, so the system must avoid guessing.",
      risk: "Fabrication"
    },
    {
      title: "Noisy or adversarial phrasing",
      scenario: "The input includes sarcasm, irrelevant content, or malformed formatting.",
      risk: "Robustness to noise"
    },
    {
      title: "Format-sensitive downstream consumer",
      scenario: "The output will be consumed by a structured workflow that depends on consistent fields.",
      risk: "Format drift"
    },
    {
      title: "Long context compression",
      scenario: "The source material is lengthy and the system must compress without losing key facts.",
      risk: "Loss of important detail"
    },
    {
      title: "Low-confidence recommendation",
      scenario: "The system can suggest next steps, but evidence is thin and should be caveated.",
      risk: "Unsupported recommendation"
    },
    {
      title: "Conflicting signals",
      scenario: "Two parts of the input appear to disagree, and the system must note the conflict.",
      risk: "False resolution"
    },
    {
      title: "Edge-case stakeholder need",
      scenario: "The workflow output is reviewed by a specialized user with strict expectations.",
      risk: "Mismatch to reviewer needs"
    }
  ];

  const testCases = Array.from({ length: 10 }, (_, index) => {
    const scenario = choose(scenarioPool, seed, index);

    return {
      id: `TC-${String(index + 1).padStart(2, "0")}`,
      title: `${scenario.title} for ${input.workflowName}`,
      scenario: scenario.scenario,
      sampleInput: `Sample ${inputType.toLowerCase()} for ${input.workflowName}: case ${index + 1} includes realistic operational detail, one subtle risk, and reviewer-relevant context.`,
      expectedBehavior: `The system should produce ${outputType.toLowerCase()} that captures the key facts, notes uncertainty where appropriate, and remains useful for the ${userType.toLowerCase()}.`,
      primaryRisk: scenario.risk
    };
  });

  const evalKit: EvalKit = {
    workflowSummary: {
      summary: `${input.workflowName} should transform ${inputType.toLowerCase()} into ${outputType.toLowerCase()} that helps the ${userType.toLowerCase()} move faster without sacrificing accuracy.`,
      inputAssumptions: [
        `Input usually arrives as ${inputType.toLowerCase()}.`,
        "Source material may be incomplete, noisy, or partially contradictory.",
        `Reviewers care about fidelity to the original workflow goal of ${businessGoal.toLowerCase()}.`
      ],
      outputAssumptions: [
        `${outputType} should be concise and easy to act on.`,
        "Structured fields need to remain stable across examples.",
        "Outputs should separate grounded facts from soft recommendations."
      ],
      evalFocus: [
        "Factual coverage of critical details",
        "Constraint adherence and risk awareness",
        "Usefulness for downstream human decision-making"
      ]
    },
    successCriteria: successCriteriaPool.slice(0, 7),
    failureModes: failureModePool.slice(0, 8),
    testCases,
    graderRubric: [
      {
        name: "Factual Fidelity",
        description: "Measures whether the output stays grounded in the provided input.",
        scaleMin: 1,
        scaleMax: 5,
        highScoreMeaning: "All important claims are well-supported by the source material.",
        lowScoreMeaning: "The output contains unsupported or contradictory claims."
      },
      {
        name: "Task Completion",
        description: "Checks whether the workflow completes the requested job end to end.",
        scaleMin: 1,
        scaleMax: 5,
        highScoreMeaning: "The response covers all requested fields and supports the target user.",
        lowScoreMeaning: "Important workflow steps or requested outputs are missing."
      },
      {
        name: "Constraint Handling",
        description: "Evaluates how well the system respects business and formatting constraints.",
        scaleMin: 1,
        scaleMax: 5,
        highScoreMeaning: `The response consistently respects constraints such as ${constraint.toLowerCase()}.`,
        lowScoreMeaning: "The response violates explicit constraints or glosses over them."
      },
      {
        name: "Uncertainty Calibration",
        description: "Assesses whether ambiguity is acknowledged appropriately.",
        scaleMin: 1,
        scaleMax: 5,
        highScoreMeaning: "Uncertain areas are clearly marked without reducing overall usefulness.",
        lowScoreMeaning: "The response is either falsely confident or too vague to act on."
      },
      {
        name: "Operational Usefulness",
        description: "Judges whether the output is easy for a human operator to use immediately.",
        scaleMin: 1,
        scaleMax: 5,
        highScoreMeaning: "The output is concise, actionable, and aligned to downstream decisions.",
        lowScoreMeaning: "The output is confusing, bloated, or hard to operationalize."
      }
    ],
    evalDatasetSchema: buildDatasetSchema(input.workflowName)
  };

  return evalKitSchema.parse(evalKit);
}

async function generateWithOpenAI(input: WorkflowInput): Promise<EvalKit> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigurationError("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: buildGeneratorPrompt(input)
    })
  });

  if (!response.ok) {
    let detail = `OpenAI request failed with status ${response.status}`;

    try {
      const errorPayload = (await response.json()) as {
        error?: { message?: string };
      };
      if (errorPayload.error?.message) {
        detail = errorPayload.error.message;
      }
    } catch {
      // Ignore JSON parsing failures and use the generic status message.
    }

    throw new OpenAIGenerationError(detail);
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };

  if (!payload.output_text) {
    throw new OpenAIGenerationError("OpenAI response did not contain output_text.");
  }

  try {
    return evalKitSchema.parse(JSON.parse(payload.output_text));
  } catch {
    throw new OpenAIGenerationError("OpenAI returned invalid JSON for the eval kit.");
  }
}

export async function generateEvalKit(input: WorkflowInput): Promise<GeneratedPayload> {
  const normalized = normalizeWorkflowInput(input);

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { evalKit: buildMockEvalKit(normalized), mode: "mock" };
  }

  return { evalKit: await generateWithOpenAI(normalized), mode: "openai" };
}

export function getGeneratorErrorMessage(error: unknown): string {
  if (error instanceof OpenAIConfigurationError) {
    return "OpenAI is not configured. Add your key to .env.local or remove it to use mock mode.";
  }

  if (error instanceof OpenAIGenerationError) {
    return `OpenAI generation failed: ${error.message}`;
  }

  return "We couldn't generate an eval kit right now. Please retry.";
}
