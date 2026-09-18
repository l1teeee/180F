"use client";

import { useRef, useState } from "react";
import { MotionSpecimen } from "./specimen-shell";
import { usePulse, useReplay } from "./use-replay";

export function HoverLiftSpecimen() {
  const { playKey, replay } = useReplay();
  const firing = usePulse(playKey);
  return (
    <MotionSpecimen
      number={1}
      name="Hover lift"
      meta="box-shadow card->raise, translateY(-2px) - fast / out - clickable cards and tiles only"
      onReplay={replay}
    >
      <div
        className={`flex h-14 w-32 items-center justify-center rounded-card-sm border border-border bg-surface text-xs font-semibold text-ink transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-raise ${
          firing ? "-translate-y-0.5 shadow-raise" : ""
        }`}
      >
        Hover me
      </div>
    </MotionSpecimen>
  );
}

export function PressSpecimen() {
  const { playKey, replay } = useReplay();
  const firing = usePulse(playKey, 260);
  return (
    <MotionSpecimen
      number={2}
      name="Press"
      meta="scale(0.98) - instant / out - buttons, clickable cards"
      onReplay={replay}
    >
      <button
        type="button"
        className={`inline-flex h-10 items-center justify-center rounded-field bg-purple-deep px-5 text-sm font-semibold text-white transition-transform duration-[var(--duration-instant)] ease-[var(--ease-out)] active:scale-[0.98] ${
          firing ? "scale-[0.98]" : ""
        }`}
      >
        Press me
      </button>
    </MotionSpecimen>
  );
}

const TABS = ["Upcoming", "Past", "Cancelled"];

export function TabIndicatorSpecimen() {
  const [active, setActive] = useState(0);
  const replay = () => setActive((index) => (index + 1) % TABS.length);
  return (
    <MotionSpecimen
      number={13}
      name="Tab indicator"
      meta="transform - base / inout - tab bars, status tabs"
      onReplay={replay}
    >
      <div className="relative inline-flex rounded-pill bg-surface-muted p-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[84px] rounded-pill bg-surface shadow-card transition-transform duration-[var(--duration-base)] ease-[var(--ease-inout)]"
          style={{ transform: `translateX(${active * 84}px)` }}
        />
        {TABS.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(index)}
            className={`relative z-10 w-[84px] rounded-pill px-2 py-1.5 text-xs font-semibold whitespace-nowrap ${
              active === index ? "text-ink" : "text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </MotionSpecimen>
  );
}

export function SwitchKnobSpecimen() {
  const [on, setOn] = useState(false);
  const replay = () => setOn((value) => !value);
  return (
    <MotionSpecimen number={15} name="Switch knob" meta="translateX - 160ms / emphasis - toggles" onReplay={replay}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Email reminders"
        onClick={() => setOn((value) => !value)}
        className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors duration-[var(--duration-fast)] ${
          on ? "bg-purple-deep" : "bg-surface-muted"
        }`}
      >
        <span
          className="absolute top-1 left-1 h-5 w-5 rounded-pill bg-white shadow-card transition-transform duration-[160ms] ease-[var(--ease-emphasis)]"
          style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </MotionSpecimen>
  );
}

// Pattern 16 "Focus ring" (docs/03 12.2, 12.6). The 12.6 closing rule is explicit: a specimen that
// illustrates the focused state uses a STATIC class, never the live :focus-visible pseudo-class,
// and is marked as a specimen - so the ring on the left is always-on CSS, not a real focus state.
// Replay moves real keyboard-equivalent focus onto the live control on the right, so the reviewer
// can also see the genuine :focus-visible ring fire (the same ring, same globals.css rule) without
// having to tab there themselves.
export function FocusRingSpecimen() {
  const liveRef = useRef<HTMLButtonElement>(null);
  const replay = () => liveRef.current?.focus();
  return (
    <MotionSpecimen number={16} name="Focus ring" meta="none - appears instantly - every interactive element" onReplay={replay}>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-field border border-border bg-surface text-xs font-semibold text-ink outline outline-2 outline-offset-2 outline-purple"
          >
            Aa
          </span>
          <span className="text-[10px] text-text-secondary">Specimen (static)</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            ref={liveRef}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-field border border-border bg-surface text-xs font-semibold text-ink"
          >
            Aa
          </button>
          <span className="text-[10px] text-text-secondary">Tab here, or Replay</span>
        </div>
      </div>
    </MotionSpecimen>
  );
}
