import { z } from "zod";

export const workflowInputSchema = z.object({
  workflowName: z.string().trim().min(1, "Workflow name is required."),
  workflowDescription: z.string().trim().min(1, "Workflow description is required."),
  userType: z.string().trim().optional(),
  inputType: z.string().trim().optional(),
  outputType: z.string().trim().optional(),
  businessGoal: z.string().trim().optional(),
  constraints: z.string().trim().optional(),
  edgeCases: z.string().trim().optional()
});

export const generationSettingsSchema = z
  .object({
    provider: z.enum(["mock", "openai", "xai", "openai-compatible"]),
    model: z.string().trim()
  })
  .superRefine((value, context) => {
    if (value.provider !== "mock" && value.model.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model is required for non-mock providers.",
        path: ["model"]
      });
    }
  });

export const generateRequestSchema = workflowInputSchema.extend({
  generation: generationSettingsSchema
});

export const evalKitSchema = z.object({
  workflowSummary: z.object({
    summary: z.string(),
    inputAssumptions: z.array(z.string()),
    outputAssumptions: z.array(z.string()),
    evalFocus: z.array(z.string())
  }),
  successCriteria: z.array(z.string()).min(5).max(8),
  failureModes: z.array(z.string()).min(6).max(10),
  testCases: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        scenario: z.string(),
        sampleInput: z.string(),
        expectedBehavior: z.string(),
        primaryRisk: z.string()
      })
    )
    .min(8)
    .max(12),
  graderRubric: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        scaleMin: z.number(),
        scaleMax: z.number(),
        highScoreMeaning: z.string(),
        lowScoreMeaning: z.string()
      })
    )
    .min(4)
    .max(6),
  evalDatasetSchema: z.object({
    type: z.string(),
    properties: z.record(z.unknown()),
    required: z.array(z.string())
  })
});

export const generateResponseSchema = z.object({
  evalKit: evalKitSchema,
  provider: z.enum(["mock", "openai", "xai", "openai-compatible"]),
  model: z.string()
});

export type WorkflowInputSchema = z.infer<typeof workflowInputSchema>;
export type EvalKitSchema = z.infer<typeof evalKitSchema>;
