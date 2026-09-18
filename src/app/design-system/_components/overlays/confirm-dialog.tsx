"use client";

import { useId } from "react";
import { CalendarX } from "lucide-react";
import { OverlayButton, OverlayFooter, OverlayHeader, overlayCardClassName } from "./overlay-chrome";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

interface ConfirmDialogCardProps {
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
  autoFocusSafeAction?: boolean;
}

// Pattern B, "Confirm dialog" (docs/03 11.4-B) - sm, destructive. The consequence sentence IS the
// body: this size exists for "confirmations, single-field edits" (11.2), so there is nothing else
// to show. Labelled "Keep booking" rather than the doc's literal "Cancel" for the safe action,
// because this specific confirm is itself about cancelling something - a bare "Cancel" button
// next to a "Cancel booking" button reads as two ways to do the same thing.
function ConfirmDialogCard({ titleId, descriptionId, onClose, autoFocusSafeAction }: ConfirmDialogCardProps) {
  return (
    <div className={overlayCardClassName(420)}>
      <div className="flex flex-col gap-5 px-6 pt-6 pb-6">
        <OverlayHeader
          title="Cancel this booking?"
          titleId={titleId}
          description="Customer 04 will lose their spot in Functional Training, Friday 6:00 PM."
          descriptionId={descriptionId}
          onClose={onClose}
          icon={CalendarX}
        />
        <OverlayFooter>
          <OverlayButton variant="secondary" onClick={onClose} autoFocus={autoFocusSafeAction}>
            Keep booking
          </OverlayButton>
          <OverlayButton variant="destructive" onClick={onClose}>
            Cancel booking
          </OverlayButton>
        </OverlayFooter>
      </div>
    </div>
  );
}

export function ConfirmDialogSpecimen() {
  return (
    <Stage label="Confirm (destructive)" className="rounded-card-sm border border-border-soft p-6">
      <div className="relative z-10 flex justify-center">
        <ConfirmDialogCard />
      </div>
    </Stage>
  );
}

export function ConfirmDialogLive() {
  const titleId = useId();
  const descriptionId = useId();
  // Clicking the scrim does not close it (docs/03 11.1): the user must choose explicitly.
  const { dialogRef, open, close, handleNativeClose } = useOverlayDialog({ closeOnScrimClick: false });

  return (
    <>
      <OverlayButton variant="destructive" onClick={open}>
        Cancel booking...
      </OverlayButton>
      <dialog
        ref={dialogRef}
        onClose={handleNativeClose}
        closedby="closerequest"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="overlay-surface border-0 bg-transparent p-0"
      >
        <ConfirmDialogCard titleId={titleId} descriptionId={descriptionId} onClose={close} autoFocusSafeAction />
      </dialog>
    </>
  );
}
