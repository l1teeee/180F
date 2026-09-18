import type { CSSProperties, ReactNode } from "react";

interface SectionShellProps {
  index: number;
  title: string;
  description?: string;
  children: ReactNode;
}

// Every section on this page is presented inside the same white "Card" primitive the
// design system itself defines (docs/03 section 5) - the reference page dogfoods its own
// component language instead of using ad hoc chrome.
//
// Every section also fades up on entry (pattern 3), staggered by its own numbered index (pattern
// 4) - reusing the index already shown in the corner badge below instead of a second counter.
// Stagger is capped at 6 (12.3.5): sections past the sixth all share the max delay and enter
// together rather than cascading further down an 11-section page.
export function SectionShell({ index, title, description, children }: SectionShellProps) {
  const staggerIndex = Math.min(index - 2, 6);
  return (
    <section
      className="animate-fade-up rounded-card border border-border bg-surface p-6 shadow-card"
      style={{ "--stagger-index": staggerIndex } as CSSProperties}
    >
      <header className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-chip bg-surface-muted px-1.5 text-[11px] font-semibold tabular-nums text-text-tertiary">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] leading-tight font-[650] text-ink">{title}</h2>
          {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}
