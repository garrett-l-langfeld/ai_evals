"use client";

import type { WorkflowInput } from "@/types/eval-kit";

type WorkflowFormProps = {
  form: WorkflowInput;
  isLoading: boolean;
  error?: string;
  onChange: (field: keyof WorkflowInput, value: string) => void;
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

export function WorkflowForm({ form, isLoading, error, onChange, onSubmit }: WorkflowFormProps) {
  return (
    <section className="rounded-[28px] border border-ink/10 bg-paper/90 p-6 shadow-card backdrop-blur">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-ember">Workflow Intake</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Describe the AI workflow you want to evaluate.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
          Start with the core description, then add optional context to sharpen the generated success criteria,
          failure modes, and starter dataset.
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
                className="min-h-28 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ember focus:ring-2 focus:ring-ember/15"
              />
            ) : (
              <input
                value={form[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ember focus:ring-2 focus:ring-ember/15"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-ink/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/60">Required fields are enough for a demo. Optional fields improve specificity.</p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Generate Eval Kit"}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
    </section>
  );
}
