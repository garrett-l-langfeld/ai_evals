import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateEvalKit, getGeneratorErrorMessage } from "@/lib/generator";
import { resolveConfiguredGeneration } from "@/lib/model-providers";
import { workflowInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = workflowInputSchema.parse(body);
    const generation = resolveConfiguredGeneration();
    const result = await generateEvalKit(input, generation);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message || "Invalid request payload."
        },
        { status: 400 }
      );
    }

    console.error("Generation error:", error);

    return NextResponse.json(
      {
        error: getGeneratorErrorMessage(error)
      },
      { status: 500 }
    );
  }
}
