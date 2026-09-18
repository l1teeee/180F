"use client";

import { useCallback, useRef, type MouseEvent } from "react";

interface UseOverlayDialogOptions {
  /** Runs once the dialog has actually finished closing (Esc, scrim click, or close()). */
  onClose?: () => void;
  /** The destructive confirm passes false: the user must choose explicitly (docs/03 11.1). */
  closeOnScrimClick?: boolean;
}

// Wraps the native <dialog>. showModal() gives focus trapping, Esc-to-close and focus-return to
// the trigger for free (docs/03 section 11.6) - no hand-rolled focus trap. This hook adds only
// what the platform does not guarantee on its own: the background-scroll lock, and (for every
// pattern except the destructive confirm) closing when the scrim is clicked.
export function useOverlayDialog({ onClose, closeOnScrimClick = true }: UseOverlayDialogOptions = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback(() => {
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Fires on every close path (Esc, backdrop click, close(), or a future form submit) because it
  // is the native "close" event, not a handler attached to one specific button.
  const handleNativeClose = useCallback(() => {
    document.body.style.overflow = "";
    onClose?.();
  }, [onClose]);

  // ::backdrop click events land on the dialog element itself (there is nothing else to target),
  // so "click landed outside the visible card" is a geometry check against the dialog's own box
  // rather than an event.target comparison, which stays correct regardless of where the card's
  // own padding lives.
  const handleScrimClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!closeOnScrimClick) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const clickedInsideCard =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!clickedInsideCard) close();
    },
    [close, closeOnScrimClick],
  );

  return { dialogRef, open, close, handleNativeClose, handleScrimClick };
}
