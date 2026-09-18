// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/dashboard/": greeting line + subtitle
// (master plan section 17). Distinct from components/layout/page-header.tsx - no actions slot,
// literal copy, never a real person's name - but the same "Page title" typographic role
// (docs/03-DESIGN-SYSTEM.md section 4: 30px/700/-0.02em, secondary subtitle).
export interface DashboardHeaderProps {
  greeting: string;
  subtitle: string;
}

export function DashboardHeader({ greeting, subtitle }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink">{greeting}</h1>
      <p className="text-[15px] font-medium text-text-secondary">{subtitle}</p>
    </div>
  );
}
