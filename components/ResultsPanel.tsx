"use client";

import { downloadTextFile } from "@/lib/export";
import { evalKitToMarkdown } from "@/lib/markdown";
import type { EvalKit, WorkflowInput } from "@/types/eval-kit";
import { SectionCard } from "@/components/SectionCard";

type ResultsPanelProps = {
  input: WorkflowInput;
  evalKit: EvalKit | null;
  mode: "mock" | "openai" | null;
  isLoading: boolean;
};

export function ResultsPanel({ input, evalKit, mode, isLoading }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-ink/10 bg-ink px-6 py-8 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.24em] text-gold">Generating</p>
        <h2 className="mt-2 font-serif text-3xl">Building your starter eval kit...</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
          We&apos;re drafting success criteria, failure modes, starter test cases, a rubric, and export-ready
          artifacts.
        </p>
      </section>
    );
  }

  if (!evalKit || !mode) {
    return (
      <section className="grid-accent rounded-[28px] border border-dashed border-ink/15 bg-white/45 p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-moss">Empty State</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Your eval kit will appear here.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/70">
          Load one of the example workflows or describe your own AI system above, then generate a starter package
          you can review and export.
        </p>
      </section>
    );
  }

  const jsonExport = JSON.stringify({ input, mode, evalKit }, null, 2);
  const markdownExport = evalKitToMarkdown(input, evalKit, mode);

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-ink/10 bg-ink px-6 py-6 text-white shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Generated Kit</p>
            <h2 className="mt-2 font-serif text-3xl">{input.workflowName}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Ready for review, copy, and export. Current mode: <span className="font-semibold">{mode}</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadTextFile("eval-kit.json", jsonExport, "application/json")}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile("eval-kit.md", markdownExport, "text/markdown")}
              className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Export Markdown
            </button>
          </div>
        </div>
      </div>

      <SectionCard title="Workflow Summary" eyebrow="Context">
        <p>{evalKit.workflowSummary.summary}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">Input Assumptions</p>
            <ul className="mt-2 space-y-2">
              {evalKit.workflowSummary.inputAssumptions.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Output Assumptions</p>
            <ul className="mt-2 space-y-2">
              {evalKit.workflowSummary.outputAssumptions.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Evaluation Focus</p>
            <ul className="mt-2 space-y-2">
              {evalKit.workflowSummary.evalFocus.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="Success Criteria" eyebrow="What Good Looks Like">
          <ul className="space-y-2">
            {evalKit.successCriteria.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Failure Modes" eyebrow="Risk Map">
          <ul className="space-y-2">
            {evalKit.failureModes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Test Cases" eyebrow="Starter Dataset">
        <div className="grid gap-4 lg:grid-cols-2">
          {evalKit.testCases.map((testCase) => (
            <article
              key={testCase.id}
              className="rounded-[20px] border border-ink/10 bg-sand/55 p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-moss">{testCase.id}</p>
              <h4 className="mt-2 text-base font-semibold text-ink">{testCase.title}</h4>
              <p className="mt-2 text-sm text-ink/75">{testCase.scenario}</p>
              <p className="mt-3 text-sm"><span className="font-semibold">Sample input:</span> {testCase.sampleInput}</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Expected behavior:</span> {testCase.expectedBehavior}</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Primary risk:</span> {testCase.primaryRisk}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Grader Rubric" eyebrow="Scoring Guide">
          <div className="space-y-4">
            {evalKit.graderRubric.map((dimension) => (
              <article
                key={dimension.name}
                className="rounded-[20px] border border-ink/10 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-base font-semibold text-ink">{dimension.name}</h4>
                  <span className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember">
                    {dimension.scaleMin}-{dimension.scaleMax}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/75">{dimension.description}</p>
                <p className="mt-3 text-sm"><span className="font-semibold">High score:</span> {dimension.highScoreMeaning}</p>
                <p className="mt-2 text-sm"><span className="font-semibold">Low score:</span> {dimension.lowScoreMeaning}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Eval Dataset Schema" eyebrow="Export Model">
          <pre className="overflow-x-auto rounded-[20px] bg-ink p-4 text-xs leading-6 text-white">
            {JSON.stringify(evalKit.evalDatasetSchema, null, 2)}
          </pre>
        </SectionCard>
      </div>
    </section>
  );
}
