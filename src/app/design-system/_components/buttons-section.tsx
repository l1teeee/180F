import type { ReactNode } from "react";
import { Bell, CircleHelp, Plus, Search, type LucideIcon } from "lucide-react";
import { SectionShell } from "./section-shell";

function ButtonSpecimen({
  label,
  hoverNote,
  children,
}: {
  label: string;
  hoverNote: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{label}</span>
      {children}
      <span className="text-xs text-text-secondary">Hover: {hoverNote}</span>
    </div>
  );
}

const ICON_BUTTONS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Search, label: "Search" },
  { Icon: Bell, label: "Notifications" },
  { Icon: CircleHelp, label: "Help" },
  { Icon: Plus, label: "Add" },
];

export function ButtonsSection() {
  return (
    <SectionShell
      index={4}
      title="Buttons"
      description="Hover runs on the base/out timing; press (pattern 2, docs/03 12.2) is instant/out and scales to 98%."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ButtonSpecimen label="Primary" hoverNote="opacity dips to 90% (white on --color-purple fails AA, ADR-020)">
          <button
            type="button"
            className="inline-flex h-10 w-fit items-center justify-center rounded-field bg-purple-deep px-5 text-sm font-semibold text-white transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98] active:duration-[var(--duration-instant)]"
          >
            Book a class
          </button>
        </ButtonSpecimen>
        <ButtonSpecimen label="Ink" hoverNote="opacity dips to 90% (no separate hover fill specified)">
          <button
            type="button"
            className="inline-flex h-10 w-fit items-center justify-center rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98] active:duration-[var(--duration-instant)]"
          >
            + New booking
          </button>
        </ButtonSpecimen>
        <ButtonSpecimen label="Secondary" hoverNote="elevation shadow-card -> shadow-raise">
          <button
            type="button"
            className="inline-flex h-10 w-fit items-center justify-center rounded-field border border-border bg-surface px-5 text-sm font-semibold text-ink shadow-card transition-[box-shadow,transform] duration-200 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
          >
            Export
          </button>
        </ButtonSpecimen>
        <ButtonSpecimen label="Ghost" hoverNote="background -> surface-muted">
          <button
            type="button"
            className="inline-flex h-10 w-fit items-center justify-center rounded-field px-5 text-sm font-semibold text-text-secondary transition-[background-color,transform] duration-200 hover:bg-surface-muted active:scale-[0.98] active:duration-[var(--duration-instant)]"
          >
            Cancel
          </button>
        </ButtonSpecimen>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
        <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
          Icon buttons
        </span>
        <div className="flex items-center gap-3">
          {ICON_BUTTONS.map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-pill border border-border bg-surface text-ink transition-[box-shadow,transform] duration-200 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>
        <span className="text-xs text-text-secondary">Hover: elevation shadow-card -&gt; shadow-raise</span>
      </div>
    </SectionShell>
  );
}
