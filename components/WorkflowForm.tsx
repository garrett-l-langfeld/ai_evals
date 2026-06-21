"use client";

import { getProviderLabel, providerOptions } from "@/lib/model-providers";
import type { GenerationProvider, GenerationSettings, WorkflowInput } from "@/types/eval-kit";

type WorkflowFormProps = {
  form: WorkflowInput;
  generation: GenerationSettings;
  isLoading: boolean;
  error?: string;
  onChange: (field: keyof WorkflowInput, value: string) => void;
  onProviderChange: (provider: GenerationProvider) => void;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
};

const fields: Array<{
  key: keyof WorkflowInput;
  label: string;
  required?: boolean;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    key: "workflowName",
    label: "Workflow Name",
    required: true,
    placeholder: "Customer Support Ticket Summarizer"
  },
  {
    key: "workflowDescription",
    label: "Workflow Description",
    required: true,
    placeholder: "Describe what the AI system does, what it reads, and what it should produce.",
    multiline: true
  },
  {
    key: "userType",
    label: "User Type",
    placeholder: "Support agent, AE, operator"
  },
  {
    key: "inputType",
    label: "Input Type",
    placeholder: "Ticket text, transcript, company name"
  },
  {
    key: "outputType",
    label: "Output Type",
    placeholder: "Structured summary, rubric, recommendation"
  },
  {
    key: "businessGoal",
    label: "Business Goal",
    placeholder: "Reduce triage time, improve follow-up quality"
  },
  {
    key: "constraints",
    label: "Constraints",
    placeholder: "Must not invent facts, must follow a template",
    multiline: true
  },
  {
    key: "edgeCases",
    label: "Edge Cases",
    placeholder: "Ambiguous input, missing fields, adversarial phrasing",
    multiline: true
  }
];

export function WorkflowForm({
  form,
  generation,
  isLoading,
  error,
  onChange,
  onProviderChange,
  onModelChange,
  onSubmit
}: WorkflowFormProps) {
  return (
    <section className="rounded-[36px] border border-ink/8 bg-paper/88 p-7 shadow-panel backdrop-blur-sm">
      <div className="mb-8">
        <p className="editorial-kicker text-[11px] uppercase text-moss">Workflow Intake</p>
        <h2 className="mt-3 max-w-2xl font-serif text-[2.4rem] leading-tight text-ink">
          Describe the system, then shape the evaluation around what matters.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate">
          Start with the core description, then add optional context to sharpen the generated success criteria,
          failure modes, and starter dataset.
        </p>
      </div>

      <div className="mb-7 rounded-[28px] border border-ink/8 bg-fog/80 p-5">
        <p className="editorial-kicker text-[11px] uppercase text-moss">Model Engine</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink">Provider</span>
            <select
              value={generation.provider}
              onChange={(event) => onProviderChange(event.target.value as GenerationProvider)}
              className="w-full rounded-[20px] border border-ink/10 bg-white/95 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              {providerOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-ink">Model</span>
            <input
              value={generation.model}
              onChange={(event) => onModelChange(event.target.value)}
              disabled={generation.provider === "mock"}
              placeholder={providerOptions.find((option) => option.value === generation.provider)?.defaultModel}
              className="w-full rounded-[20px] border border-ink/10 bg-white/95 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate/45 focus:border-moss focus:ring-2 focus:ring-moss/15 disabled:cursor-not-allowed disabled:bg-white/60"
            />
          </label>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate">
          {providerOptions.find((option) => option.value === generation.provider)?.description}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate/70">
          Active engine: {getProviderLabel(generation.provider)} / {generation.model}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.key}
            className={field.multiline ? "md:col-span-2" : ""}
          >
            <span className="mb-2 block text-sm font-semibold text-ink">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.multiline ? (
              <textarea
                rows={4}
                value={form[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="min-h-28 w-full rounded-[22px] border border-ink/10 bg-white/96 px-5 py-4 text-sm text-ink outline-none transition placeholder:text-slate/45 focus:border-moss focus:ring-2 focus:ring-moss/15"
              />
            ) : (
              <input
                value={form[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-[22px] border border-ink/10 bg-white/96 px-5 py-4 text-sm text-ink outline-none transition placeholder:text-slate/45 focus:border-moss focus:ring-2 focus:ring-moss/15"
              />
            )}
          </label>
        ))}
      </div>

      <div className="soft-divider mt-8" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-7 text-slate">
          Required fields are enough for a demo. Optional fields improve specificity.
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1a3044] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate Eval Kit"}
        </button>
      </div>

      {error ? (
        <p className="mt-5 rounded-[22px] border border-ember/14 bg-ember/8 px-4 py-3 text-sm text-ember">{error}</p>
      ) : null}
    </section>
  );
}
