"use client";

import { useState } from "react";
import { EasingCurve } from "./motion/easing-curve";
import { BarFillSpecimen, ChartDrawSpecimen, NumberRollSpecimen } from "./motion/specimens-data";
import { DrawerSpecimen, FadeUpSpecimen, ShimmerSpecimen, StaggerSpecimen, ToastSpecimen } from "./motion/specimens-entrance";
import {
  FocusRingSpecimen,
  HoverLiftSpecimen,
  PressSpecimen,
  SwitchKnobSpecimen,
  TabIndicatorSpecimen,
} from "./motion/specimens-interaction";
import { CollapseSpecimen, OverlaysSpecimen, RouteChangeSpecimen } from "./motion/specimens-structural";
import { SHIMMER_DURATION_NOTE, TokensTable } from "./motion/tokens-table";
import { SectionShell } from "./section-shell";

const EASINGS: { label: string; x1: number; y1: number; x2: number; y2: number }[] = [
  { label: "out", x1: 0.22, y1: 1, x2: 0.36, y2: 1 },
  { label: "in", x1: 0.4, y1: 0, x2: 1, y2: 1 },
  { label: "inout", x1: 0.65, y1: 0, x2: 0.35, y2: 1 },
  { label: "emphasis", x1: 0.34, y1: 1.26, x2: 0.64, y2: 1 },
];

// docs/03 section 12, "Motion system" - every one of the sixteen 12.2 patterns as a live,
// replayable specimen, following the same static-specimen-plus-live-trigger idea section 11 above
// already established for overlays.
export function MotionSection() {
  const [reduced, setReduced] = useState(false);

  return (
    <SectionShell
      index={12}
      title="Motion"
      description="150-320ms, opacity and transform only, nothing loops except skeletons - every pattern below, replayable."
    >
      <div className="flex flex-col gap-8">
        <TokensTable />
        <p className="-mt-4 text-xs text-text-secondary">{SHIMMER_DURATION_NOTE}</p>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">Easing curves</span>
          <div className="grid grid-cols-2 gap-4 rounded-card-sm border border-border bg-surface p-5 sm:grid-cols-4">
            {EASINGS.map((easing) => (
              <EasingCurve key={easing.label} {...easing} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-card-sm border border-purple-soft bg-purple-xsoft p-4">
          <p className="text-sm font-semibold text-purple-deep">Two rules that matter most</p>
          <ul className="flex flex-col gap-1 text-sm text-purple-deep">
            <li>
              Data changes do not animate - a KPI rolls once, on first arrival; a later update jumps instantly, because
              the point of that demo moment is that every screen already agrees (12.3.2).
            </li>
            <li>Stagger is capped at six children - a 148-row table does not cascade (12.3.5).</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6">
          <label className="inline-flex w-fit items-center gap-2.5 rounded-pill border border-border bg-surface py-2 pr-4 pl-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={reduced}
              onChange={(event) => setReduced(event.target.checked)}
              className="h-4 w-4 accent-purple-deep"
            />
            Preview reduced motion for this section
          </label>
          <p className="text-xs text-text-secondary">
            {reduced
              ? "Previewing: fade up, stagger, shimmer, toast, drawer, number roll and bar fill below are rendering their 12.4 collapse. Hover, press and the other interaction-driven patterns are untouched by this preference (12.4 governs entrances, the shimmer, the number roll and bar fills/chart draws only)."
              : "Off: every specimen below plays its full motion. This toggle simulates the OS/browser prefers-reduced-motion setting for this section only - the real mechanism (globals.css, one global block) is what actually governs the product."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <HoverLiftSpecimen />
          <PressSpecimen />
          <FadeUpSpecimen reduced={reduced} />
          <StaggerSpecimen reduced={reduced} />
          <ShimmerSpecimen reduced={reduced} />
          <NumberRollSpecimen reduced={reduced} />
          <BarFillSpecimen reduced={reduced} />
          <ChartDrawSpecimen />
          <RouteChangeSpecimen />
          <ToastSpecimen reduced={reduced} />
          <OverlaysSpecimen />
          <CollapseSpecimen />
          <TabIndicatorSpecimen />
          <DrawerSpecimen reduced={reduced} />
          <SwitchKnobSpecimen />
          <FocusRingSpecimen />
        </div>
      </div>
    </SectionShell>
  );
}
