// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/03 section 4 "Page title": 30px/700/-0.02em,
// subtitle secondary, actions right-aligned (the single ink CTA per screen, master plan §51).
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode; // the single ink CTA per screen, when the screen has one (§51)
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle ? <p className="text-[15px] font-medium text-text-secondary">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
