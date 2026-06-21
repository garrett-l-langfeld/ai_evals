import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="section-fade rounded-[28px] border border-ink/8 bg-white/82 p-6 shadow-card backdrop-blur-sm">
      {eyebrow ? <p className="editorial-kicker text-[11px] uppercase text-moss">{eyebrow}</p> : null}
      <h3 className="mt-3 font-serif text-[2rem] leading-tight text-ink">{title}</h3>
      <div className="mt-5 text-sm leading-7 text-slate">{children}</div>
    </section>
  );
}
