import type { WorkflowInput } from "@/types/eval-kit";

export const exampleWorkflows: WorkflowInput[] = [
  {
    workflowName: "Customer Support Ticket Summarizer",
    workflowDescription:
      "An AI system reads customer support tickets and produces a short summary, issue category, priority level, and recommended next action for support agents.",
    userType: "Support agent",
    inputType: "Support ticket text plus metadata",
    outputType: "Summary, category, priority, and next action",
    businessGoal: "Reduce triage time while preserving issue accuracy.",
    constraints: "Must avoid inventing account facts or unsupported urgency.",
    edgeCases: "Multi-issue tickets, emotional language, missing context"
  },
  {
    workflowName: "Sales Call Summarizer",
    workflowDescription:
      "An AI system processes sales call transcripts and outputs a concise summary, key objections, customer goals, and follow-up actions for the account executive.",
    userType: "Account executive",
    inputType: "Call transcript",
    outputType: "Deal summary and follow-up notes",
    businessGoal: "Speed up CRM updates and improve follow-through after calls.",
    constraints: "Should distinguish explicit commitments from speculation.",
    edgeCases: "Cross-talk, partial transcript, multiple stakeholders"
  },
  {
    workflowName: "Company Research Agent",
    workflowDescription:
      "An AI system researches a target company and generates a structured brief including business model, recent news, product overview, and potential sales talking points.",
    userType: "Forward deployed engineer",
    inputType: "Company name and optional target segment",
    outputType: "Structured company brief",
    businessGoal: "Create faster pre-call preparation for outbound teams.",
    constraints: "Should separate verified facts from soft inferences.",
    edgeCases: "Private companies, outdated sources, name collisions"
  }
];
