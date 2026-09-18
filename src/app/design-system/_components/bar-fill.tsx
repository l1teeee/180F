"use client";

import { useEffect, useRef, useState } from "react";

interface BarFillProps {
  /** Target fill percentage, 0-100. */
  value: number;
  className?: string;
  /** Demo-only override for the Motion section's reduced-motion preview toggle (below) - wins
      over the real matchMedia check so the collapse can be shown without an OS setting change. */
  forceReduced?: boolean;
}

// Pattern 7 "Bar fill" (docs/03 12.2): width animates from 0 to its final value once, on mount,
// and never again - the same first-arrival-only discipline as the number roll (12.3.2), so a
// later re-render with a changed value (occupancy shifting after a booking) jumps instantly
// instead of replaying the grow-in. Width is one of the two properties this rule set allows
// outside opacity/transform (12.3.1), so the bar's own width animates directly rather than a
// scaleX substitute.
export function BarFill({ value, className = "", forceReduced }: BarFillProps) {
  const [width, setWidth] = useState(0);
  // Whether THIS write should skip the CSS transition - true once already animated once, or under
  // reduced motion (12.4: "bar fills... render at final state with no transition"). Plain state
  // (not read off the ref directly) so the render that shows the new width already has the right
  // transition class applied in the same pass.
  const [skipTransition, setSkipTransition] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reduceMotion = forceReduced ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instant = hasAnimated.current || reduceMotion;
    hasAnimated.current = true;

    // One rAF so the browser commits the starting width before `value` is applied - without it
    // the two style writes can land in the same frame and the transition never plays. Both state
    // updates are deferred into this callback (not called inline above) so the effect body itself
    // never calls setState synchronously.
    const frame = requestAnimationFrame(() => {
      setSkipTransition(instant);
      setWidth(value);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, forceReduced]);

  return (
    <span
      className={`block h-full rounded-pill ${
        skipTransition ? "" : "transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]"
      } ${className}`}
      style={{ width: `${width}%` }}
    />
  );
}
