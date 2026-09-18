"use client";

import { useId } from "react";
import { Pill, type PillTone } from "../pill";
import { FIELD_LABEL_CLASSNAME, OverlayButton, OverlayFooter, OverlayHeader } from "./overlay-chrome";
import { OccupancyStrip } from "./occupancy-strip";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

const BOOKING_LIST: { customer: string; status: string; tone: PillTone }[] = [
  { customer: "Customer 04", status: "Confirmed", tone: "positive" },
  { customer: "Customer 07", status: "Confirmed", tone: "positive" },
  { customer: "Customer 11", status: "Pending", tone: "pending" },
];

// Sheet chrome is its own thing, not overlayCardClassName's centred-dialog chrome: it fills its
// positioning box exactly (inset 12px on every edge, docs/03 11.4-C) rather than shrinking to
// content, and all four corners round the same 24px since it floats clear of every edge.
const SHEET_CARD_CLASSNAME =
  "flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-modal";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={FIELD_LABEL_CLASSNAME}>{label}</span>
      <p className="text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}

interface SessionSheetCardProps {
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
}

// Pattern C, "Side sheet" (docs/03 11.4-C).
function SessionSheetCard({ titleId, descriptionId, onClose }: SessionSheetCardProps) {
  return (
    <div className={SHEET_CARD_CLASSNAME}>
      <div className="flex-none px-6 pt-6 pb-1">
        <OverlayHeader
          title="Session details"
          titleId={titleId}
          description="Power Yoga - Fri, Sep 18"
          descriptionId={descriptionId}
          onClose={onClose}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-5">
          <InfoField label="Class" value="Power Yoga" />
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Date" value="Fri, Sep 18" />
            <InfoField label="Time" value="7:00 AM" />
            <InfoField label="Instructor" value="Instructor 05" />
            <InfoField label="Room" value="Studio 1" />
          </div>
          <OccupancyStrip occupied={9} capacity={15} />
          <div className="flex flex-col gap-3">
            <span className={FIELD_LABEL_CLASSNAME}>Bookings</span>
            <ul className="flex flex-col gap-2.5">
              {BOOKING_LIST.map((row) => (
                <li key={row.customer} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{row.customer}</span>
                  <Pill label={row.status} tone={row.tone} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-none px-6 pt-5 pb-6">
        <OverlayFooter>
          <OverlayButton variant="secondary" onClick={onClose}>
            View bookings
          </OverlayButton>
          <OverlayButton variant="primary" onClick={onClose}>
            Edit class
          </OverlayButton>
        </OverlayFooter>
      </div>
    </div>
  );
}

export function SessionSheetSpecimen() {
  return (
    <Stage label="Side sheet (420px, right, inset 12px)" className="h-[440px] rounded-card-sm border border-border-soft">
      <div className="absolute top-3 right-3 bottom-3 z-10 w-[420px] max-w-[calc(100%-1.5rem)]">
        <SessionSheetCard />
      </div>
    </Stage>
  );
}

export function SessionSheetLive() {
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog();

  return (
    <>
      <OverlayButton variant="primary" onClick={open}>
        Open session details
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
        className="overlay-surface overlay-surface--right fixed top-3 right-3 bottom-3 left-auto m-0 h-auto w-[420px] max-w-[calc(100vw-1.5rem)] border-0 bg-transparent p-0"
      >
        <SessionSheetCard titleId={titleId} descriptionId={descriptionId} onClose={close} />
      </dialog>
    </>
  );
}
