"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { useOverlayDialog } from "../overlays/use-overlay-dialog";
import { MotionSpecimen } from "./specimen-shell";

// Pattern 12 "Collapse". grid-template-rows, not a max-height guess (12.2 note): a wrong guess
// either clips content or adds dead delay. The header is independently clickable, like a real
// accordion, in addition to Replay - both drive the same toggle.
export function CollapseSpecimen() {
  const [expanded, setExpanded] = useState(true);
  return (
    <MotionSpecimen
      number={12}
      name="Collapse"
      meta="grid-template-rows 0fr->1fr - base / inout - accordions, filter panels"
      onReplay={() => setExpanded((value) => !value)}
    >
      <div className="w-full max-w-[240px]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between rounded-field border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink"
        >
          Filters
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-[var(--ease-inout)]"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="px-3 py-2 text-xs text-text-secondary">Studio, instructor, class type...</p>
          </div>
        </div>
      </div>
    </MotionSpecimen>
  );
}

// Pattern 9 "Route change" - content opacity only; the sidebar (the solid ink bar here) never
// animates, which is the point this specimen makes concrete rather than only asserting in prose.
export function RouteChangeSpecimen() {
  const [visible, setVisible] = useState(true);
  const replay = () => {
    setVisible(false);
    setTimeout(() => setVisible(true), 160);
  };
  return (
    <MotionSpecimen
      number={9}
      name="Route change"
      meta="content opacity only - fast / out - the main content area; the sidebar never animates"
      onReplay={replay}
    >
      <div className="flex h-16 w-full max-w-[220px] gap-2">
        <div aria-hidden="true" className="w-8 shrink-0 rounded-field bg-ink" />
        <div
          className={`flex-1 rounded-field bg-surface-lilac transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </MotionSpecimen>
  );
}

// Pattern 11 "Overlays" - not a new mechanism: this dialog uses the exact .overlay-surface class
// and useOverlayDialog hook section 11 already built, so its motion (and its reduced-motion
// collapse, already gated behind prefers-reduced-motion: no-preference in globals.css) is the real
// thing, not a re-implementation. Replay just opens it again.
export function OverlaysSpecimen() {
  const titleId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog();
  return (
    <MotionSpecimen
      number={11}
      name="Overlays"
      meta="see section 11.5 above - dialog, sheet, bottom sheet, palette"
      onReplay={open}
    >
      <button
        type="button"
        onClick={open}
        className="inline-flex h-9 items-center justify-center rounded-field border border-border bg-surface px-4 text-xs font-semibold text-ink transition-shadow duration-[var(--duration-fast)] hover:shadow-raise"
      >
        Open a dialog
      </button>
      <dialog
        ref={dialogRef}
        onClose={handleNativeClose}
        onClick={handleScrimClick}
        closedby="any"
        aria-modal="true"
        aria-labelledby={titleId}
        className="overlay-surface w-[min(320px,calc(100vw-2rem))] rounded-card border border-border bg-surface p-5 shadow-modal"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h4 id={titleId} className="text-[15px] font-semibold text-ink">
              Same motion as section 11
            </h4>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            This reuses the real .overlay-surface CSS, not a copy - see the six patterns above.
          </p>
        </div>
      </dialog>
    </MotionSpecimen>
  );
}
