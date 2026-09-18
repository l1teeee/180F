import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";

interface MotionSpecimenProps {
  number: number;
  name: string;
  /** "properties - duration / easing - used by" from the docs/03 12.2 table. */
  meta: string;
  onReplay: () => void;
  children: ReactNode;
}

// One card per row of the docs/03 12.2 pattern table: number, name, its own properties/timing/
// used-by line, a live demo stage, and a Replay button so the reviewer never has to reload the
// page to see a pattern fire again.
export function MotionSpecimen({ number, name, meta, onReplay, children }: MotionSpecimenProps) {
  return (
    <div className="flex flex-col gap-4 rounded-card-sm border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-purple-xsoft text-xs font-bold text-purple-deep tabular-nums"
          >
            {number}
          </span>
          <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
        </div>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface px-3 text-xs font-semibold text-text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted"
        >
          <RotateCcw aria-hidden="true" className="h-3 w-3" />
          Replay
        </button>
      </div>
      <div className="flex min-h-[92px] items-center justify-center overflow-hidden rounded-field bg-canvas-wash p-4">
        {children}
      </div>
      <p className="text-xs text-text-secondary">{meta}</p>
    </div>
  );
}
