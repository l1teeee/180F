"use client";

import { useState } from "react";
import { BarFill } from "../bar-fill";
import { NumberRoll } from "../number-roll";
import { MotionSpecimen } from "./specimen-shell";
import { useMountFade, useReplay } from "./use-replay";

interface DataSpecimenProps {
  reduced: boolean;
}

// Patterns 6-8 are "data changes do not animate" made concrete (12.3.2): each renders once on
// arrival, then a later value change must jump, never replay. Replay here remounts (key={playKey})
// to show the genuine first-arrival roll/fill again; the number roll specimen additionally exposes
// a second control that changes its value WITHOUT remounting, to make the "no replay on a data
// change" half of the rule visible too, not just assert it in the note below the grid.
export function NumberRollSpecimen({ reduced }: DataSpecimenProps) {
  const { playKey, replay } = useReplay();
  const [value, setValue] = useState(128);
  return (
    <MotionSpecimen
      number={6}
      name="Number roll"
      meta="counts up to the final value - 600ms / out - KPI metrics, first data arrival only"
      onReplay={replay}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
          <NumberRoll key={playKey} value={value} forceReduced={reduced} />
        </span>
        <button
          type="button"
          onClick={() => setValue((current) => current + 7)}
          className="inline-flex h-7 items-center rounded-pill border border-border bg-surface px-2.5 text-[11px] font-semibold text-text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted"
        >
          Change value (no replay)
        </button>
      </div>
    </MotionSpecimen>
  );
}

export function BarFillSpecimen({ reduced }: DataSpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={7}
      name="Bar fill"
      meta="width 0->n% - slow / out - occupancy bars, progress"
      onReplay={replay}
    >
      <div className="w-full max-w-[220px]">
        <span className="block h-2 w-full overflow-hidden rounded-pill bg-surface-muted">
          <BarFill key={playKey} value={72} className="bg-purple" forceReduced={reduced} />
        </span>
      </div>
    </MotionSpecimen>
  );
}

const CHART_DRAW_BARS = [40, 70, 55, 85];

function ChartDrawBars() {
  const grown = useMountFade();
  return (
    <div className="flex h-16 items-end gap-2">
      {CHART_DRAW_BARS.map((height, index) => (
        <span
          key={index}
          className="w-5 origin-bottom rounded-pill bg-hatch transition-transform duration-[400ms] ease-[var(--ease-out)]"
          style={{
            height,
            transform: grown ? "scaleY(1)" : "scaleY(0)",
            transitionDelay: `${index * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Recharts drives this in the real app (its own `animationDuration` prop, not a CSS utility here);
// the hand-built charts on this page (section 7) are plain SVG/CSS, so this specimen illustrates
// the pattern generically rather than retrofitting it onto WeeklyBarChart/WaveChart.
export function ChartDrawSpecimen() {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={8}
      name="Chart draw"
      meta="Recharts animationDuration - 400ms, 60ms stagger per series - mount only"
      onReplay={replay}
    >
      <ChartDrawBars key={playKey} />
    </MotionSpecimen>
  );
}
