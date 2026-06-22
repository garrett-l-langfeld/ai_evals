"use client";

import { useState } from "react";
import { ExampleButtons } from "@/components/ExampleButtons";
import { ResultsPanel } from "@/components/ResultsPanel";
import { WorkflowForm } from "@/components/WorkflowForm";
import { exampleWorkflows } from "@/lib/examples";
import { workflowInputSchema } from "@/lib/schemas";
import type { EvalKit, GenerationProvider, WorkflowInput } from "@/types/eval-kit";

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

  async function handleSubmit() {
    const parsedInput = workflowInputSchema.safeParse(form);

    if (!parsedInput.success) {
      setError(parsedInput.error.issues[0]?.message || "Please complete the required fields.");
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
        body: JSON.stringify(parsedInput.data)
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
          <div className="px-6 py-8 lg:px-10 lg:py-10">
            <div className="relative z-10">
              <p className="editorial-kicker text-[11px] uppercase text-gold">Evaluation Design Toolkit</p>
              <h1 className="mt-4 font-serif text-[2.55rem] leading-[1.03] text-[#edf2f7] sm:text-[3.35rem]">
                Generate success criteria, failure modes, starter test cases, a scoring rubric, and an exportable
                dataset schema for the AI workflow you&apos;re shaping.
              </h1>
            </div>
          </div>
        </header>

        <section className="hero-sheen mb-7 rounded-[30px] border border-white/10 bg-ink/92 p-6 text-white shadow-panel backdrop-blur-sm lg:p-8">
          <div className="relative z-10">
            <p className="editorial-kicker text-[11px] uppercase text-gold">Quick Start</p>
            <h2 className="mt-3 font-serif text-[2rem] leading-tight">
              Load an example and generate in under a minute.
            </h2>
            <div className="mt-5">
              <ExampleButtons examples={exampleWorkflows} onLoadExample={loadExample} />
            </div>
          </div>
        </section>

        <div className="space-y-7">
          <WorkflowForm
            form={form}
            isLoading={isLoading}
            error={error}
            onChange={updateField}
            onSubmit={handleSubmit}
          />
          <ResultsPanel input={form} evalKit={evalKit} provider={provider} model={model} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
