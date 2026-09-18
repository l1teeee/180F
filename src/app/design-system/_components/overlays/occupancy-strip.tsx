import { Pill } from "../pill";

interface OccupancyStripProps {
  occupied: number;
  capacity: number;
}

// The capacity strip from docs/03 section 11.4-A: an occupancy bar plus "x / y spots reserved"
// in tabular numerals, escalating to an amber "Almost full" pill at >=85% and a "Full" pill at
// capacity. This is a display-only read of two numbers PASSED IN AS PROPS BY THE CALLER - every
// call site on this page hardcodes its own example numbers, exactly like every other specimen in
// this design-system preview (see e.g. CardsSection's "148" active-members figure). It does not
// read real session data and must never become one: the booking ledger and its occupancy math
// stay the single source of truth in src/domain/selectors/sessions.ts (CLAUDE.md invariant 5).
export function OccupancyStrip({ occupied, capacity }: OccupancyStripProps) {
  const ratio = capacity > 0 ? occupied / capacity : 0;
  const available = capacity - occupied;
  const isFull = available <= 0;
  const isAlmostFull = !isFull && ratio >= 0.85;
  const percentage = Math.max(0, Math.min(100, Math.round(ratio * 100)));

  return (
    <div className="flex flex-col gap-2.5 rounded-card-sm border border-border-soft bg-canvas-wash p-3.5">
      <div className="flex items-center gap-3">
        <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-muted">
          <span
            className={`block h-full rounded-pill ${isFull ? "bg-danger" : isAlmostFull ? "bg-yellow" : "bg-purple"}`}
            style={{ width: `${percentage}%` }}
          />
        </span>
        <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
          {occupied} / {capacity} spots reserved
        </span>
      </div>
      {isFull ? (
        <div>
          <Pill label="Full" tone="danger" />
        </div>
      ) : isAlmostFull ? (
        <div>
          <Pill label="Almost full" tone="pending" />
        </div>
      ) : null}
    </div>
  );
}
