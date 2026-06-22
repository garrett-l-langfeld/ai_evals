export type WorkflowInput = {
  workflowName: string;
  workflowDescription: string;
  userType?: string;
  inputType?: string;
  outputType?: string;
  businessGoal?: string;
  constraints?: string;
  edgeCases?: string;
};

export type GenerationProvider = "mock" | "openai" | "xai" | "anthropic" | "gemini" | "openai-compatible";

export type GenerationSettings = {
  provider: GenerationProvider;
  model: string;
};

export type EvalKit = {
  workflowSummary: {
    summary: string;
    inputAssumptions: string[];
    outputAssumptions: string[];
    evalFocus: string[];
  };
  successCriteria: string[];
  failureModes: string[];
  testCases: Array<{
    id: string;
    title: string;
    scenario: string;
    sampleInput: string;
    expectedBehavior: string;
    primaryRisk: string;
  }>;
  graderRubric: Array<{
    name: string;
    description: string;
    scaleMin: number;
    scaleMax: number;
    highScoreMeaning: string;
    lowScoreMeaning: string;
  }>;
  evalDatasetSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
};
