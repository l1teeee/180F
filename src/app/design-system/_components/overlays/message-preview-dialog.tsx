"use client";

import { useId, useState } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { Pill } from "../pill";
import {
  FIELD_CLASSNAME,
  FIELD_LABEL_CLASSNAME,
  OverlayButton,
  OverlayFooter,
  OverlayHeader,
  overlayCardClassName,
} from "./overlay-chrome";
import { Stage } from "./stage";
import { useOverlayDialog } from "./use-overlay-dialog";

const TEMPLATE_OPTIONS = ["Booking reminder", "Class cancelled", "Waitlist opened"];
const RECIPIENT_OPTIONS = ["Customer 04", "Customer 07", "Customer 11"];
const CLASS_OPTIONS = ["Power Yoga", "HIIT Circuit", "Functional Training"];

type SendStatus = "idle" | "sending" | "sent";

interface MessagePreviewCardProps {
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
}

// Pattern F, "Message preview dialog" (docs/03 11.4-F) - the WhatsApp simulation. The "Simulated"
// pill is not user-dismissible (it has no close control of its own; only the dialog's own close
// button dismisses the whole dialog) and the copy never claims a real send - "Send test" and
// "Test message sent" both say test, on top of the pill (master plan 33 and 66.9, CLAUDE.md "no
// real network call from ... the WhatsApp preview").
function MessagePreviewCard({ titleId, descriptionId, onClose }: MessagePreviewCardProps) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const idPrefix = useId();

  function handleSendTest() {
    setStatus("sending");
    // ~800ms per docs/03 11.4-F - this only drives a local spinner, never a real request.
    window.setTimeout(() => setStatus("sent"), 800);
  }

  return (
    <div className={overlayCardClassName("lg")}>
      <div className="flex-none px-6 pt-6 pb-1">
        <OverlayHeader
          title="Message preview"
          titleId={titleId}
          description="Template fields on the left, exactly what the customer would see on the right."
          descriptionId={descriptionId}
          onClose={onClose}
          badge={<Pill label="Simulated" tone="neutralBrand" />}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${idPrefix}-template`} className={FIELD_LABEL_CLASSNAME}>
                Template
              </label>
              {/* Focus moves to the first field on open (docs/03 11.6) - harmless on the inert
                  static specimen, since inert also removes it from focus order. */}
              <select id={`${idPrefix}-template`} defaultValue="Booking reminder" autoFocus className={FIELD_CLASSNAME}>
                {TEMPLATE_OPTIONS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${idPrefix}-recipient`} className={FIELD_LABEL_CLASSNAME}>
                Recipient
              </label>
              <select id={`${idPrefix}-recipient`} defaultValue="Customer 04" className={FIELD_CLASSNAME}>
                {RECIPIENT_OPTIONS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${idPrefix}-class`} className={FIELD_LABEL_CLASSNAME}>
                Class
              </label>
              <select id={`${idPrefix}-class`} defaultValue="Power Yoga" className={FIELD_CLASSNAME}>
                {CLASS_OPTIONS.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-card-sm border border-border-soft bg-canvas-wash p-4">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-card-sm bg-green-soft px-4 py-3 text-sm text-ink">
                Hi Customer 04! This is a reminder for your Power Yoga class tomorrow at 7:00 AM. Reply STOP to opt
                out.
              </p>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-text-tertiary">
              <CircleCheck aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="tabular-nums">Delivered 5:02 PM</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-none px-6 pt-5 pb-6">
        <OverlayFooter>
          <OverlayButton variant="secondary" onClick={onClose}>
            Close
          </OverlayButton>
          <span className="flex items-center gap-3">
            {status === "sent" ? (
              <span role="status" className="flex items-center gap-1.5 text-sm font-medium text-green-text">
                <CircleCheck aria-hidden="true" className="h-4 w-4" />
                Test message sent
              </span>
            ) : null}
            <OverlayButton variant="primary" onClick={handleSendTest} disabled={status === "sending"}>
              {status === "sending" ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Send aria-hidden="true" className="h-4 w-4" />
              )}
              {status === "sending" ? "Sending..." : "Send test"}
            </OverlayButton>
          </span>
        </OverlayFooter>
      </div>
    </div>
  );
}

export function MessagePreviewSpecimen() {
  return (
    <Stage label="Message preview (lg, 680px)" className="rounded-card-sm border border-border-soft p-8">
      <div className="relative z-10 flex justify-center">
        <MessagePreviewCard />
      </div>
    </Stage>
  );
}

export function MessagePreviewLive() {
  const [instanceKey, setInstanceKey] = useState(0);
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, open, close, handleNativeClose, handleScrimClick } = useOverlayDialog({
    // Fresh mount so a re-opened dialog never shows a stale "Test message sent" confirmation.
    onClose: () => setInstanceKey((key) => key + 1),
  });

  return (
    <>
      <OverlayButton variant="primary" onClick={open}>
        Preview WhatsApp message
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
        <MessagePreviewCard key={instanceKey} titleId={titleId} descriptionId={descriptionId} onClose={close} />
      </dialog>
    </>
  );
}
