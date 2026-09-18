'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/03 section 11.4-B "Confirm dialog": sm
// (420px), destructive gets a danger-tinted icon square above the title, footer is Cancel
// (secondary) + the destructive action filled with --color-danger-deep, and clicking the scrim
// does not close it (11.1) - the user must choose explicitly. Built on the restyled ui/dialog
// primitive rather than the design-system preview's native-<dialog> prototype, since this one
// needs the controlled open/onOpenChange contract docs/07 section 4 specifies.
import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string; // default 'Confirm'
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  // Radix's own close-focus restore (@radix-ui/react-dialog's DialogContentModal) targets
  // context.triggerRef, which only DialogTrigger ever sets - this dialog has no DialogTrigger
  // (it is opened by the caller's own state, e.g. bookings/page.tsx's cancelTarget), so that ref
  // is always null and focus fell through to document.body on every close. Capturing the real
  // opener ourselves - as state, set during render (React's documented "adjusting state when a
  // prop changes" pattern, same as data-table.tsx used to use for its own page reset) rather
  // than a ref written mid-render or an effect - means it is captured before DialogContent's own
  // autoFocus Cancel button (below) can steal document.activeElement first.
  const [wasOpen, setWasOpen] = useState(open);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && typeof document !== 'undefined') {
      setOpener(document.activeElement as HTMLElement | null);
    }
  }

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // The caller's onConfirm owns surfacing its own error (inline message / toast, docs/06
      // section 3.4) - this dialog's only job on a rejection is to stay open, not to explain it.
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? null : onOpenChange(next))}>
      <DialogContent
        size="sm"
        onPointerDownOutside={(event) => {
          if (destructive || pending) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener?.focus();
        }}
      >
        <DialogHeader>
          {destructive ? (
            <span aria-hidden="true" className="mb-1 flex h-10 w-10 items-center justify-center rounded-chip bg-danger-soft text-danger-deep">
              <TriangleAlert className="h-5 w-5" />
            </span>
          ) : null}
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" autoFocus disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={handleConfirm}
            className={destructive ? 'bg-danger-deep hover:opacity-90' : undefined}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
