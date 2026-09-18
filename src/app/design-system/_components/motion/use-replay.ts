"use client";

import { useCallback, useEffect, useState } from "react";

// Every specimen on the Motion section replays the same way: bump a counter. A one-shot entrance
// specimen (fade up, shimmer, toast, drawer...) uses it as a React `key` to remount the animated
// node, which is what makes a CSS animation play again. A state-driven specimen (hover lift,
// switch knob, tab indicator...) watches it in an effect instead, to pulse a temporary "active"
// state for a moment so the reviewer can see the transition fire without actually hovering or
// clicking themselves.
export function useReplay() {
  const [playKey, setPlayKey] = useState(0);
  const replay = useCallback(() => setPlayKey((key) => key + 1), []);
  return { playKey, replay };
}

// The reduced-motion preview toggle (docs/03 12.4) can't fake the real `prefers-reduced-motion`
// media feature the global CSS block in globals.css keys off, so the three keyframe-driven entrance
// specimens (fade up, toast, drawer) that need to visibly honour it fall back to this: a plain
// opacity-only transition, capped at --duration-fast, in place of their normal `animate-*` class -
// the same end state 12.4 prescribes, reached by ordinary React state instead of the media query.
// Callers mount the element using this hook under `key={playKey}` so a replay resets `visible` to
// its initial `false` by remounting, rather than this hook resetting it itself.
// Pulses `active` true for a moment on every replay (not on the initial mount) - how the
// interaction-state specimens (hover lift, press...) simulate their pseudo-class firing once,
// on demand, for a reviewer who is not currently hovering or clicking the demo element.
export function usePulse(playKey: number, holdMs = 650): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (playKey === 0) return;
    const frame = requestAnimationFrame(() => setActive(true));
    const timeout = setTimeout(() => setActive(false), holdMs);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [playKey, holdMs]);
  return active;
}

export function useMountFade(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return visible;
}
