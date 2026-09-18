"use client";

import { useEffect, useRef, useState } from "react";

interface NumberRollProps {
  value: number;
  /** ms; defaults to the 600ms pattern 6 "Number roll" specifies (docs/03 12.2). */
  duration?: number;
  /** Demo-only override for the Motion section's reduced-motion preview toggle (below) - wins
      over the real matchMedia check so the collapse can be shown without an OS setting change. */
  forceReduced?: boolean;
}

// Pattern 6 "Number roll" (docs/03 12.2, 12.3.2): counts up once, on first arrival, and never
// again. `value` staying in the effect's dependency array is what makes this correct rather than
// a lint suppression: a re-render with the SAME value never re-runs the effect at all (React
// skips effects whose dependencies are unchanged), and a re-render with a DIFFERENT value re-runs
// it but takes the early-return branch below, which jumps straight to the new value with no roll.
// This is the rule that keeps a created booking from re-animating every chart on screen (12.3.2) -
// every KPI on the page already agrees the instant the booking lands.
export function NumberRoll({ value, duration = 600, forceReduced }: NumberRollProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reduceMotion = forceReduced ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Already rolled once, or motion is reduced: jump straight to the value with no interpolation.
    // Deferred one frame (rather than called inline here) so every branch of this effect updates
    // state from inside a callback, never synchronously in the effect body itself.
    if (hasAnimated.current || reduceMotion) {
      hasAnimated.current = true;
      const frame = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(frame);
    }

    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // approximates --ease-out for a rAF-driven count
      setDisplayValue(Math.round(eased * value));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        hasAnimated.current = true;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, forceReduced]);

  return <>{displayValue}</>;
}
