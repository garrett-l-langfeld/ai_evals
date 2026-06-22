import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="hero-sheen section-fade rounded-[30px] border border-white/10 bg-ink/96 p-6 text-white shadow-panel">
      {eyebrow ? <p className="editorial-kicker text-[11px] uppercase text-gold">{eyebrow}</p> : null}
      <h3 className="mt-3 font-serif text-[2rem] leading-tight text-[#d1dbe5]">{title}</h3>
      <div className="mt-5 text-sm leading-7 text-white/72">{children}</div>
    </section>
  );
}
