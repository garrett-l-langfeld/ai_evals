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
          className="rounded-full border border-white/18 bg-white/6 px-4 py-2 text-sm font-medium text-white/88 transition hover:-translate-y-0.5 hover:border-[#d7c29a] hover:bg-white/10"
        >
          {`Load Example ${index + 1}`}
        </button>
      ))}
    </div>
  );
}
