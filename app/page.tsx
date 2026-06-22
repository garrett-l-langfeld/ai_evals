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
        <header className="hero-sheen mb-7 overflow-hidden rounded-[34px] border border-ink/8 bg-ink text-white shadow-panel">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.22fr_0.78fr] lg:px-10 lg:py-10">
            <div className="relative z-10">
              <p className="editorial-kicker text-[11px] uppercase text-gold">Evaluation Design Toolkit</p>
              <h1 className="mt-4 max-w-4xl font-serif text-[2.55rem] leading-[1.03] text-[#edf2f7] sm:text-[3.35rem]">
                Generate success criteria, failure modes, starter test cases, a scoring rubric, and an exportable
                dataset schema for the AI workflow you&apos;re shaping.
              </h1>
            </div>

            <div className="relative z-10 rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-md">
              <p className="editorial-kicker text-[11px] uppercase text-gold">Quick Start</p>
              <h2 className="mt-3 max-w-md font-serif text-[2rem] leading-tight">
                Load an example and generate in under a minute.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Switch between mock, OpenAI, xAI, or any OpenAI-compatible endpoint without changing the app
                architecture.
              </p>
              <div className="mt-6">
                <ExampleButtons examples={exampleWorkflows} onLoadExample={loadExample} />
              </div>
              <div className="soft-divider mt-7" />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold text-white">3</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/52">Starter Workflows</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">4</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/52">Generation Modes</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">2</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/52">Export Formats</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
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
