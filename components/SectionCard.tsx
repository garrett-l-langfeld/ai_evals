import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="section-fade rounded-[24px] border border-ink/10 bg-white/80 p-5 shadow-card">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.22em] text-moss">{eyebrow}</p> : null}
      <h3 className="mt-2 font-serif text-2xl text-ink">{title}</h3>
      <div className="mt-4 text-sm leading-6 text-ink/80">{children}</div>
    </section>
  );
}
