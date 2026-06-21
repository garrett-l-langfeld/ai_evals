import type { EvalKit, WorkflowInput } from "@/types/eval-kit";

export function evalKitToMarkdown(
  input: WorkflowInput,
  evalKit: EvalKit,
  provider: string,
  model: string
): string {
  const summary = evalKit.workflowSummary;

  return [
    `# AI Eval Starter Kit: ${input.workflowName}`,
    "",
    `Generated provider: ${provider}`,
    `Generated model: ${model}`,
    "",
    "## Workflow Input",
    `- Description: ${input.workflowDescription}`,
    `- User type: ${input.userType || "Not provided"}`,
    `- Input type: ${input.inputType || "Not provided"}`,
    `- Output type: ${input.outputType || "Not provided"}`,
    `- Business goal: ${input.businessGoal || "Not provided"}`,
    `- Constraints: ${input.constraints || "Not provided"}`,
    `- Edge cases: ${input.edgeCases || "Not provided"}`,
    "",
    "## Workflow Summary",
    summary.summary,
    "",
    "### Input Assumptions",
    ...summary.inputAssumptions.map((item) => `- ${item}`),
    "",
    "### Output Assumptions",
    ...summary.outputAssumptions.map((item) => `- ${item}`),
    "",
    "### Evaluation Focus",
    ...summary.evalFocus.map((item) => `- ${item}`),
    "",
    "## Success Criteria",
    ...evalKit.successCriteria.map((item) => `- ${item}`),
    "",
    "## Failure Modes",
    ...evalKit.failureModes.map((item) => `- ${item}`),
    "",
    "## Test Cases",
    ...evalKit.testCases.flatMap((testCase) => [
      `### ${testCase.id}: ${testCase.title}`,
      `- Scenario: ${testCase.scenario}`,
      `- Sample input: ${testCase.sampleInput}`,
      `- Expected behavior: ${testCase.expectedBehavior}`,
      `- Primary risk: ${testCase.primaryRisk}`,
      ""
    ]),
    "## Grader Rubric",
    ...evalKit.graderRubric.flatMap((dimension) => [
      `### ${dimension.name}`,
      `- Description: ${dimension.description}`,
      `- Scale: ${dimension.scaleMin} to ${dimension.scaleMax}`,
      `- High score: ${dimension.highScoreMeaning}`,
      `- Low score: ${dimension.lowScoreMeaning}`,
      ""
    ]),
    "## Eval Dataset Schema",
    "```json",
    JSON.stringify(evalKit.evalDatasetSchema, null, 2),
    "```"
  ].join("\n");
}
