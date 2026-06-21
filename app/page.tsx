"use client";

import { useState } from "react";
import { ExampleButtons } from "@/components/ExampleButtons";
import { ResultsPanel } from "@/components/ResultsPanel";
import { WorkflowForm } from "@/components/WorkflowForm";
import { exampleWorkflows } from "@/lib/examples";
import { getDefaultModel } from "@/lib/model-providers";
import { generateRequestSchema, workflowInputSchema } from "@/lib/schemas";
import type { EvalKit, GenerationProvider, GenerationSettings, WorkflowInput } from "@/types/eval-kit";

const defaultForm: WorkflowInput = {
  workflowName: "",
  workflowDescription: "",
  userType: "",
  inputType: "",
  outputType: "",
  businessGoal: "",
  constraints: "",
  edgeCases: ""
};

export default function HomePage() {
  const [form, setForm] = useState<WorkflowInput>(defaultForm);
  const [evalKit, setEvalKit] = useState<EvalKit | null>(null);
  const [generation, setGeneration] = useState<GenerationSettings>({
    provider: "mock",
    model: getDefaultModel("mock")
  });
  const [provider, setProvider] = useState<GenerationProvider | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  function updateField(field: keyof WorkflowInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function loadExample(example: WorkflowInput) {
    setForm(example);
    setError("");
  }

  function handleProviderChange(nextProvider: GenerationProvider) {
    setGeneration({
      provider: nextProvider,
      model: getDefaultModel(nextProvider)
    });
  }

  function handleModelChange(nextModel: string) {
    setGeneration((current) => ({
      ...current,
      model: nextModel
    }));
  }

  async function handleSubmit() {
    const parsedInput = workflowInputSchema.safeParse(form);

    if (!parsedInput.success) {
      setError(parsedInput.error.issues[0]?.message || "Please complete the required fields.");
      return;
    }

    const parsedRequest = generateRequestSchema.safeParse({
      ...parsedInput.data,
      generation
    });

    if (!parsedRequest.success) {
      setError(parsedRequest.error.issues[0]?.message || "Please choose a valid provider and model.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedRequest.data)
      });

      const payload = (await response.json()) as {
        error?: string;
        evalKit?: EvalKit;
        provider?: GenerationProvider;
        model?: string;
      };

      if (!response.ok || !payload.evalKit || !payload.provider || !payload.model) {
        throw new Error(payload.error || "Generation failed.");
      }

      setEvalKit(payload.evalKit);
      setProvider(payload.provider);
      setModel(payload.model);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-ink/10 bg-ink text-white shadow-card">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold">AI Eval Starter Kit</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
                Turn a plain-English workflow idea into an eval-ready starter package.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Generate success criteria, failure modes, starter test cases, a scoring rubric, and an exportable
                dataset schema for the AI workflow you&apos;re shaping.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-gold">Quick Start</p>
              <h2 className="mt-2 font-serif text-2xl">Load an example and generate in under a minute.</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Switch between mock, OpenAI, xAI, or any OpenAI-compatible endpoint without changing the app
                architecture.
              </p>
              <div className="mt-5">
                <ExampleButtons examples={exampleWorkflows} onLoadExample={loadExample} />
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <WorkflowForm
            form={form}
            generation={generation}
            isLoading={isLoading}
            error={error}
            onChange={updateField}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onSubmit={handleSubmit}
          />
          <ResultsPanel input={form} evalKit={evalKit} provider={provider} model={model} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
