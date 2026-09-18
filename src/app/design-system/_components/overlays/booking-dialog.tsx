"use client";

import { useId } from "react";
import {
  FIELD_CLASSNAME,
  FIELD_LABEL_CLASSNAME,
  OverlayButton,
  OverlayFooter,
  OverlayHeader,
  overlayCardClassName,
} from "./overlay-chrome";
import { OccupancyStrip } from "./occupancy-strip";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

const CUSTOMER_OPTIONS = ["Customer 04", "Customer 07", "Customer 11", "Customer 15"];
const CLASS_OPTIONS = ["Functional Training", "Power Yoga", "HIIT Circuit", "Strength Lab", "Spin Express"];
const TIME_OPTIONS = ["7:00 AM", "9:00 AM", "11:30 AM", "6:00 PM"];

interface BookingDialogFieldsProps {
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
  occupied: number;
  capacity: number;
}

// The shared content for pattern A, "Form dialog" (docs/03 11.4-A) - rendered identically inside
// a static Stage (inert, so these real <select>/<input> elements can't actually be focused or
// clicked) and inside the live <dialog>, so the two forms can never visually drift apart.
function BookingDialogFields({ titleId, descriptionId, onClose, occupied, capacity }: BookingDialogFieldsProps) {
  const isFull = capacity - occupied <= 0;
  const idPrefix = useId();

  return (
    <div className={overlayCardClassName(520)}>
      <div className="flex-none px-6 pt-6 pb-1">
        <OverlayHeader
          title="New booking"
          titleId={titleId}
          description="Reserve a spot for a customer in an upcoming class."
          descriptionId={descriptionId}
          onClose={onClose}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="flex flex-col gap-1.5">
            <span id={`${idPrefix}-instructor-label`} className={FIELD_LABEL_CLASSNAME}>
              Instructor
            </span>
            {/* Not a form control: nothing here is submitted, it is a derived, read-only fact
                about the session (docs/03 11.4-A), so it skips input/select semantics entirely. */}
            <div
              aria-labelledby={`${idPrefix}-instructor-label`}
              className="flex h-10 items-center justify-between rounded-field border border-border bg-surface-muted px-3 text-sm text-ink"
            >
              <span>Instructor 02</span>
              <span className="text-xs text-text-tertiary">Derived from class</span>
            </div>
          </div>
          <OccupancyStrip occupied={occupied} capacity={capacity} />
          {isFull ? (
            <p className="text-sm text-text-secondary">
              This class is full. Join the waitlist and we will reach out the moment a spot opens.
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex-none px-6 pt-5 pb-6">
        <OverlayFooter>
          <OverlayButton variant="secondary" onClick={onClose}>
            Cancel
          </OverlayButton>
          <OverlayButton variant="primary" onClick={onClose}>
            {isFull ? "Join waitlist" : "Reserve booking"}
          </OverlayButton>
        </OverlayFooter>
      </div>
    </div>
  );
}

// Three static states so the occupancy escalation is comparable at a glance: available, amber
// "almost full" at >=85%, and full (where the primary action becomes "Join waitlist" instead of a
// dead disabled button) - docs/03 11.4-A and CLAUDE.md ADR-008's >=0.85 / <=0 thresholds.
export function BookingDialogSpecimens() {
  const states = [
    { label: "Available (12 / 15)", occupied: 12, capacity: 15 },
    { label: "Almost full (13 / 15)", occupied: 13, capacity: 15 },
    { label: "Full (15 / 15)", occupied: 15, capacity: 15 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {states.map((state) => (
        <Stage key={state.label} label={state.label} className="rounded-card-sm border border-border-soft p-6">
          <div className="relative z-10 flex justify-center">
            <BookingDialogFields occupied={state.occupied} capacity={state.capacity} />
          </div>
        </Stage>
      ))}
    </div>
  );
}

export function BookingDialogLive() {
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog();

  return (
    <>
      <OverlayButton variant="primary" onClick={open}>
        Open new booking
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
        className="overlay-surface border-0 bg-transparent p-0"
      >
        <BookingDialogFields
          titleId={titleId}
          descriptionId={descriptionId}
          onClose={close}
          occupied={12}
          capacity={15}
        />
      </dialog>
    </>
  );
}
