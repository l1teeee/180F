"use client";

import { useId } from "react";
import { FIELD_CLASSNAME, FIELD_LABEL_CLASSNAME, OverlayButton, OverlayFooter, OverlayHeader } from "./overlay-chrome";
import { OccupancyStrip } from "./occupancy-strip";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

const CUSTOMER_OPTIONS = ["Customer 04", "Customer 07", "Customer 11", "Customer 15"];
const CLASS_OPTIONS = ["Functional Training", "Power Yoga", "HIIT Circuit", "Strength Lab", "Spin Express"];
const TIME_OPTIONS = ["7:00 AM", "9:00 AM", "11:30 AM", "6:00 PM"];

// Bottom-sheet chrome: top corners round to --radius-card, bottom corners are square against the
// screen edge (docs/03 11.4-D) - the opposite radius split from the centred-dialog chrome, so it
// is its own constant rather than overlayCardClassName.
const SHEET_CARD_CLASSNAME =
  "flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-card rounded-b-none border border-border bg-surface shadow-modal";

interface BottomSheetFieldsProps {
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
}

// Pattern D, "Bottom sheet" (docs/03 11.4-D) - the mobile form of A, with the 36x4px grab handle.
// Always single-column: this is already the collapsed mobile layout, not a responsive component
// reacting to viewport width (see bottom-sheet's own file-level note in the handoff for why).
function BottomSheetFields({ titleId, descriptionId, onClose }: BottomSheetFieldsProps) {
  const idPrefix = useId();

  return (
    <div className={SHEET_CARD_CLASSNAME}>
      <div className="flex-none pt-3">
        <div aria-hidden="true" className="mx-auto h-1 w-9 rounded-pill bg-border" />
      </div>
      <div className="flex-none px-5 pt-4 pb-1">
        <OverlayHeader
          title="New booking"
          titleId={titleId}
          description="Reserve a spot for a customer in an upcoming class."
          descriptionId={descriptionId}
          onClose={onClose}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-customer`} className={FIELD_LABEL_CLASSNAME}>
              Customer
            </label>
            {/* Focus moves to the first field on open (docs/03 11.6) - harmless on the inert
                static specimen, since inert also removes it from focus order. */}
            <select id={`${idPrefix}-customer`} defaultValue="Customer 04" autoFocus className={FIELD_CLASSNAME}>
              {CUSTOMER_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-class`} className={FIELD_LABEL_CLASSNAME}>
              Class
            </label>
            <select id={`${idPrefix}-class`} defaultValue="Functional Training" className={FIELD_CLASSNAME}>
              {CLASS_OPTIONS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-date`} className={FIELD_LABEL_CLASSNAME}>
              Date
            </label>
            <input id={`${idPrefix}-date`} type="date" defaultValue="2026-09-18" className={FIELD_CLASSNAME} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-time`} className={FIELD_LABEL_CLASSNAME}>
              Time
            </label>
            <select id={`${idPrefix}-time`} defaultValue="6:00 PM" className={FIELD_CLASSNAME}>
              {TIME_OPTIONS.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span id={`${idPrefix}-instructor-label`} className={FIELD_LABEL_CLASSNAME}>
              Instructor
            </span>
            <div
              aria-labelledby={`${idPrefix}-instructor-label`}
              className="flex h-10 items-center justify-between rounded-field border border-border bg-surface-muted px-3 text-sm text-ink"
            >
              <span>Instructor 02</span>
              <span className="text-xs text-text-tertiary">Derived</span>
            </div>
          </div>
          <OccupancyStrip occupied={12} capacity={15} />
        </div>
      </div>
      <div className="flex-none px-5 pt-4 pb-5">
        <OverlayFooter forceStacked>
          <OverlayButton variant="secondary" onClick={onClose} className="w-full">
            Cancel
          </OverlayButton>
          <OverlayButton variant="primary" onClick={onClose} className="w-full">
            Reserve booking
          </OverlayButton>
        </OverlayFooter>
      </div>
    </div>
  );
}

export function BottomSheetSpecimen() {
  // The 390px phone stage is wider than the page's own content column below that same
  // breakpoint (page padding + PatternBlock padding eat into the 390px viewport before this
  // box's own width is accounted for) - contained in its own horizontal scroll area so the
  // fixed-width mockup never forces the whole design-system page to scroll sideways.
  return (
    <div className="w-full overflow-x-auto">
      <Stage
        label="Bottom sheet (390px phone stage)"
        className="mx-auto h-[700px] w-[390px] shrink-0 rounded-[32px] border-2 border-border"
      >
        <div className="absolute inset-x-0 bottom-0 z-10">
          <BottomSheetFields />
        </div>
      </Stage>
    </div>
  );
}

export function BottomSheetLive() {
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog();

  return (
    <>
      <OverlayButton variant="primary" onClick={open}>
        Open bottom sheet
      </OverlayButton>
      <dialog
        ref={dialogRef}
        onClose={handleNativeClose}
        onClick={handleScrimClick}
        closedby="any"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="overlay-surface overlay-surface--bottom fixed inset-x-0 top-auto bottom-0 m-0 h-auto max-h-[85vh] w-full border-0 bg-transparent p-0"
      >
        <BottomSheetFields titleId={titleId} descriptionId={descriptionId} onClose={close} />
      </dialog>
    </>
  );
}
