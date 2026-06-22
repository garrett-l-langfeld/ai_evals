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

export function WorkflowForm({
  form,
  isLoading,
  error,
  onChange,
  onSubmit
}: WorkflowFormProps) {
  return (
    <section className="rounded-[30px] border border-ink/8 bg-paper/92 p-7 shadow-card backdrop-blur-sm">
      <div className="mb-8">
        <p className="editorial-kicker text-[11px] uppercase text-moss">Workflow Intake</p>
        <h2 className="mt-3 font-serif text-[2.15rem] leading-tight text-[#d1dbe5]">
          Describe the system, then shape the evaluation around what matters most.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/68">
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
            <span className="mb-2 block text-sm font-semibold text-[#b6c4d2]">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.multiline ? (
              <textarea
                rows={4}
                value={form[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="min-h-28 w-full rounded-[20px] border border-ink/10 bg-white/97 px-5 py-4 text-sm text-ink outline-none transition placeholder:text-slate/45 focus:border-moss focus:ring-2 focus:ring-moss/15"
              />
            ) : (
              <input
                value={form[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-[20px] border border-ink/10 bg-white/97 px-5 py-4 text-sm text-ink outline-none transition placeholder:text-slate/45 focus:border-moss focus:ring-2 focus:ring-moss/15"
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
          className="rounded-full border border-[#f0e2c6]/70 bg-[#e2cfaa] px-7 py-3.5 text-sm font-semibold text-[#15283b] shadow-[0_10px_28px_rgba(211,190,160,0.28)] transition hover:-translate-y-0.5 hover:bg-[#eddabc] hover:shadow-[0_14px_32px_rgba(211,190,160,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
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
