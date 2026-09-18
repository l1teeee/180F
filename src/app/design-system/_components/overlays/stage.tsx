import type { ReactNode } from "react";

interface StageProps {
  label: string;
  /** Sizing/border/radius for this specimen's box - deliberately not defaulted (see below). */
  className?: string;
  children: ReactNode;
}

// A "stage" renders an overlay's exact composition without opening anything: the app background
// under a scrim-toned, blurred backdrop, so the layered look is visible at rest (docs/03 section
// 11, "static specimen" requirement) - a picture of an overlay, not an overlay. Every pattern
// sizes and borders its own stage explicitly via `className` instead of inheriting a shared
// default, because the six patterns need genuinely different stage shapes (a squarish box for a
// centred dialog vs. a tall edge-anchored box for a sheet vs. a phone-shaped frame for D) and a
// single hardcoded default here would just get overridden every time it is used.
export function Stage({ label, className = "", children }: StageProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{label}</span>
      {/* inert (not just aria-hidden) so the pictured form fields/buttons can't be tabbed to or
          clicked - static specimens must be non-functional, docs/03 section 11 accessibility. */}
      <div aria-hidden="true" inert className={`relative isolate overflow-hidden bg-background ${className}`}>
        <div aria-hidden="true" className="absolute inset-0 bg-scrim backdrop-blur-[2px]" />
        {children}
      </div>
    </div>
  );
}
