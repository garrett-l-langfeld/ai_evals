"use client";

import type { WorkflowInput } from "@/types/eval-kit";

type ExampleButtonsProps = {
  examples: WorkflowInput[];
  onLoadExample: (example: WorkflowInput) => void;
};

export function ExampleButtons({ examples, onLoadExample }: ExampleButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {examples.map((example, index) => (
        <button
          key={example.workflowName}
          type="button"
          onClick={() => onLoadExample(example)}
          className="rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-ember hover:bg-white"
        >
          {`Load Example ${index + 1}`}
        </button>
      ))}
    </div>
  );
}
