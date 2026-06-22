import { evalKitSchema } from "@/lib/schemas";
import type { EvalKit, WorkflowInput } from "@/types/eval-kit";

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

function buildSampleInputText(
  workflowName: string,
  inputType: string,
  outputType: string,
  userType: string,
  scenarioTitle: string,
  index: number
) {
  const lowerInput = inputType.toLowerCase();
  const lowerOutput = outputType.toLowerCase();
  const lowerUser = userType.toLowerCase();

  switch (scenarioTitle) {
    case "Typical high-signal request":
      return `A realistic ${lowerInput} with one primary issue, explicit facts, and enough context for the ${lowerUser} to expect a clear ${lowerOutput}.`;
    case "Multiple competing issues":
      return `A single ${lowerInput} that mixes two valid problems, forcing ${workflowName} to decide what belongs in the main ${lowerOutput} versus secondary notes.`;
    case "Ambiguous source material":
      return `A partially conflicting ${lowerInput} where one important detail is implied but not confirmed, so the ${lowerOutput} should signal uncertainty.`;
    case "Missing key field":
      return `A ${lowerInput} missing one required operational detail, such as timestamp, account identifier, or final user intent, while still requesting a confident answer.`;
    case "Noisy or adversarial phrasing":
      return `A messy ${lowerInput} with sarcasm, irrelevant filler, and one genuinely important fact that the ${lowerUser} still needs surfaced in the ${lowerOutput}.`;
    case "Format-sensitive downstream consumer":
      return `A ${lowerInput} destined for a downstream workflow that expects consistent fields, stable terminology, and no extra prose outside the ${lowerOutput}.`;
    case "Long context compression":
      return `A long ${lowerInput} with repeated details, one buried operational blocker, and enough volume that ${workflowName} must compress carefully.`;
    case "Low-confidence recommendation":
      return `A ${lowerInput} where evidence supports a tentative next step but not a definitive resolution, requiring the ${lowerOutput} to stay useful without overstating confidence.`;
    case "Conflicting signals":
      return `A ${lowerInput} where one section suggests normal handling but another suggests elevated risk, and the ${lowerOutput} must surface the conflict instead of smoothing it over.`;
    case "Edge-case stakeholder need":
      return `A specialized ${lowerInput} reviewed by an exacting stakeholder who cares about precision, terminology, and whether the ${lowerOutput} is immediately audit-ready.`;
    default:
      return `Sample ${lowerInput} for ${workflowName}: case ${index + 1} should test whether the ${lowerOutput} remains useful for the ${lowerUser}.`;
  }
}

function buildExpectedBehaviorText(outputType: string, userType: string, scenarioTitle: string) {
  const lowerOutput = outputType.toLowerCase();
  const lowerUser = userType.toLowerCase();

  switch (scenarioTitle) {
    case "Typical high-signal request":
      return `Return ${lowerOutput} that captures the main issue accurately, preserves the highest-priority facts, and is immediately actionable for the ${lowerUser}.`;
    case "Multiple competing issues":
      return `Return ${lowerOutput} that represents both issues, prioritizes the more urgent one correctly, and does not hide the secondary concern.`;
    case "Ambiguous source material":
      return `Return ${lowerOutput} that separates confirmed facts from uncertain inferences and explicitly marks what still needs verification.`;
    case "Missing key field":
      return `Return ${lowerOutput} that avoids guessing the missing detail, notes the gap clearly, and still extracts the grounded information that is present.`;
    case "Noisy or adversarial phrasing":
      return `Return ${lowerOutput} that filters out irrelevant or manipulative wording while preserving the real operational signal.`;
    case "Format-sensitive downstream consumer":
      return `Return ${lowerOutput} in a consistent structure so a downstream system or reviewer can parse it without manual cleanup.`;
    case "Long context compression":
      return `Return ${lowerOutput} that compresses aggressively without losing the buried blocker, core chronology, or next-action detail.`;
    case "Low-confidence recommendation":
      return `Return ${lowerOutput} that offers a cautious recommendation only where justified and communicates confidence limits clearly.`;
    case "Conflicting signals":
      return `Return ${lowerOutput} that highlights the disagreement in the source and avoids presenting a false single interpretation.`;
    case "Edge-case stakeholder need":
      return `Return ${lowerOutput} that is precise, reviewer-friendly, and detailed enough for a specialist ${lowerUser} to trust it on first pass.`;
    default:
      return `Return ${lowerOutput} that remains useful for the ${lowerUser} and stays grounded in the source material.`;
  }
}

export function buildMockEvalKit(input: WorkflowInput): EvalKit {
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
      id: `TC-${index + 1}`,
      title: `${scenario.title} for ${input.workflowName}`,
      scenario: scenario.scenario,
      sampleInput: buildSampleInputText(input.workflowName, inputType, outputType, userType, scenario.title, index),
      expectedBehavior: buildExpectedBehaviorText(outputType, userType, scenario.title),
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
