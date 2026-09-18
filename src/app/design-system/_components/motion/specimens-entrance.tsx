"use client";

import type { CSSProperties } from "react";
import { MotionSpecimen } from "./specimen-shell";
import { useMountFade, useReplay } from "./use-replay";

interface SpecimenProps {
  /** The Motion section's reduced-motion preview toggle - see globals.css 12.4 for the real,
      OS-driven mechanism this stands in for on this page. */
  reduced: boolean;
}

function fadeClass(fadedIn: boolean): string {
  return `transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] ${fadedIn ? "opacity-100" : "opacity-0"}`;
}

function FadeUpBlock({ reduced }: { reduced: boolean }) {
  const fadedIn = useMountFade();
  return (
    <div
      className={`h-12 w-32 rounded-field border border-border-soft bg-surface-lilac ${
        reduced ? fadeClass(fadedIn) : "animate-fade-up"
      }`}
    />
  );
}

export function FadeUpSpecimen({ reduced }: SpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={3}
      name="Fade up"
      meta="opacity 0->1, translateY(8px)->0 - base / out - page sections, dialogs, popovers"
      onReplay={replay}
    >
      <FadeUpBlock key={playKey} reduced={reduced} />
    </MotionSpecimen>
  );
}

function StaggerChip({ index, reduced }: { index: number; reduced: boolean }) {
  const fadedIn = useMountFade();
  if (reduced) {
    return <span className={`h-8 w-8 rounded-chip bg-purple-xsoft ${fadeClass(fadedIn)}`} />;
  }
  return (
    <span
      className="animate-fade-up h-8 w-8 rounded-chip bg-purple-xsoft"
      style={{ "--stagger-index": index } as CSSProperties}
    />
  );
}

export function StaggerSpecimen({ reduced }: SpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={4}
      name="Stagger"
      meta="fade up + 40ms per child, capped at 6 - KPI row, card grids"
      onReplay={replay}
    >
      <div className="flex items-center gap-2" key={playKey}>
        {[0, 1, 2, 3].map((index) => (
          <StaggerChip key={index} index={index} reduced={reduced} />
        ))}
      </div>
    </MotionSpecimen>
  );
}

function ShimmerBlock({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex w-full flex-col gap-2.5 px-2">
      <span className={`h-3 w-3/4 rounded-pill ${reduced ? "bg-surface-muted" : "animate-shimmer"}`} />
      <span className={`h-3 w-1/2 rounded-pill ${reduced ? "bg-surface-muted" : "animate-shimmer"}`} />
    </div>
  );
}

export function ShimmerSpecimen({ reduced }: SpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={5}
      name="Shimmer"
      meta="gradient sweep, translateX(-100%->100%) - shimmer / linear, loops - skeletons"
      onReplay={replay}
    >
      <ShimmerBlock key={playKey} reduced={reduced} />
    </MotionSpecimen>
  );
}

function ToastBlock({ reduced }: { reduced: boolean }) {
  const fadedIn = useMountFade();
  const base = "flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-xs font-semibold text-white shadow-modal";
  return <div className={`${base} ${reduced ? fadeClass(fadedIn) : "animate-toast-in"}`}>Test message sent</div>;
}

export function ToastSpecimen({ reduced }: SpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={10}
      name="Toast"
      meta="translateY(16px)->0 + fade - base in / fast out - sonner, auto-dismiss at 4s"
      onReplay={replay}
    >
      <ToastBlock key={playKey} reduced={reduced} />
    </MotionSpecimen>
  );
}

function DrawerBlock({ reduced }: { reduced: boolean }) {
  const fadedIn = useMountFade();
  return (
    <div className="relative h-28 w-40 overflow-hidden rounded-field border border-border bg-surface">
      <div aria-hidden="true" className="absolute inset-0 bg-scrim" />
      <div
        className={`absolute inset-y-0 left-0 w-24 border-r border-border bg-surface p-2.5 ${
          reduced ? fadeClass(fadedIn) : "animate-drawer-in"
        }`}
      >
        <span className="text-[10px] font-semibold text-text-secondary">Menu</span>
      </div>
    </div>
  );
}

export function DrawerSpecimen({ reduced }: SpecimenProps) {
  const { playKey, replay } = useReplay();
  return (
    <MotionSpecimen
      number={14}
      name="Drawer"
      meta="translateX(-100%)->0, scrim fade - deliberate / out - mobile sidebar"
      onReplay={replay}
    >
      <DrawerBlock key={playKey} reduced={reduced} />
    </MotionSpecimen>
  );
}
