import type { WorkflowInput } from "@/types/eval-kit";

export function buildGeneratorPrompt(input: WorkflowInput): string {
  return [
    "You are an expert AI evaluation designer.",
    "Create a practical, concise evaluation starter kit for the workflow below.",
    "Return valid JSON only. Do not include markdown, code fences, or explanatory text.",
    "Do not add any fields outside the requested schema.",
    "Prioritize realistic failure modes, operational edge cases, and reviewer-friendly rubric language.",
    "",
    "Workflow input:",
    JSON.stringify(input, null, 2),
    "",
    "Output schema requirements:",
    "- workflowSummary.summary: short restatement of the workflow",
    "- workflowSummary.inputAssumptions: array of concise bullets",
    "- workflowSummary.outputAssumptions: array of concise bullets",
    "- workflowSummary.evalFocus: array of concise bullets",
    "- successCriteria: 5 to 8 concise criteria",
    "- failureModes: 6 to 10 realistic failure modes",
    "- testCases: 8 to 12 objects with id, title, scenario, sampleInput, expectedBehavior, primaryRisk",
    "- sampleInput and expectedBehavior must each be plain strings, not nested objects or arrays",
    "- make each test case materially different; avoid repeating the same sampleInput or expectedBehavior across cases",
    "- sampleInput should look like a concrete example the workflow could receive, not a placeholder template label",
    "- graderRubric: 4 to 6 objects with name, description, scaleMin, scaleMax, highScoreMeaning, lowScoreMeaning",
    "- evalDatasetSchema: a starter JSON schema with id, workflow_name, input, expected_output, risk_tags, grader_notes, score_dimensions"
  ].join("\n");
}
