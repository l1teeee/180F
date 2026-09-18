import { ArrowRight } from "lucide-react";
import { SectionShell } from "./section-shell";

export function InkChipBarSection() {
  return (
    <SectionShell
      index={8}
      title="Ink chip bar"
      description="The reference's black stat chip - the reserved strong accent, used at most once per screen."
    >
      <div className="inline-flex items-center gap-4 rounded-pill bg-ink py-2 pr-2 pl-4 text-white">
        <span className="text-xs font-semibold tabular-nums">18 sessions today</span>
        <span aria-hidden="true" className="h-4 w-px bg-[rgba(255,255,255,0.15)]" />
        <span className="text-xs font-semibold tabular-nums">4 instructors on floor</span>
        <button
          type="button"
          aria-label="View today's schedule"
          className="flex h-7 w-7 items-center justify-center rounded-pill bg-yellow text-ink transition-transform duration-200 hover:scale-105"
        >
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </SectionShell>
  );
}
