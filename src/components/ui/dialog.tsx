"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/cn"

// docs/03 section 11 "Overlays". Motion here is plain transition + data-state, not a keyframe
// "animate-in" library: Radix's Presence already waits for a running CSS transition to finish
// before it unmounts the content, so a transition tied to data-[state=open|closed] is enough -
// no extra CSS file and no touch to the read-only globals.css token/keyframe source of truth.

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

// section 11.1 "Scrim": --color-scrim with a 2px blur, 150ms fade.
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim opacity-0 backdrop-blur-[2px] transition-opacity duration-[var(--duration-fast)] ease-out data-[state=open]:opacity-100",
        className
      )}
      {...props}
    />
  )
}

const DIALOG_SIZE_WIDTH: Record<"sm" | "md" | "lg" | "palette", string> = {
  sm: "420px",
  md: "520px",
  lg: "680px",
  palette: "560px",
}

// section 11.2 "Container" + 11.5: 24px radius, 1px border, --shadow-modal, 24px padding,
// max-height 85vh with a scrolling body. Enter is 200ms opacity+translateY(8px)->0 on --ease-out;
// close always runs at 150ms on --ease-in (section 11.5). Below `sm`, a "center" dialog becomes
// section 11.4-D's bottom sheet instead: full width, flush to the bottom edge, top corners only,
// a grab handle, entering translateY(100%)->0 over 220ms. "position" only ever needs "center"
// and "top", so it stays a plain union, not a scale - the command palette (11.4-E, anchored 12vh
// from the top) is the one dialog exempt from the bottom sheet.
//
// Centring and the entrance offset used to both write Tailwind's single --tw-translate-y
// variable on this element (top-1/2 -translate-y-1/2 for centring, data-[state=open]:translate-y-0
// for the entrance settle) - the open-state variant always won, so transform computed to none and
// the dialog rendered from the viewport's vertical midpoint down, trapping a tall form's footer
// off-screen with background scroll locked. Centring now happens one level up, on a plain flex
// layer that writes no transform at all, so the two offsets never compete; this element only ever
// carries the entrance transform, `motion-safe:`-gated so `prefers-reduced-motion: reduce`
// collapses it to the opacity fade alone (section 12.4) instead of a translate.
function DialogContent({
  className,
  children,
  size = "md",
  position = "center",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg" | "palette"
  position?: "center" | "top"
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          "fixed inset-0 z-50 flex justify-center overflow-y-auto",
          position === "center" && "items-end sm:items-center sm:p-4",
          position === "top" && "items-start px-4 pt-[12vh] pb-4"
        )}
      >
        <DialogPrimitive.Content
          data-slot="dialog-content"
          style={{ "--dialog-w": `min(${DIALOG_SIZE_WIDTH[size]}, calc(100vw - 2rem))` } as React.CSSProperties}
          className={cn(
            "relative z-50 flex max-h-[85vh] flex-col gap-5 overflow-hidden border border-border bg-surface p-6 text-sm text-ink shadow-modal opacity-0 outline-none transition-[opacity,transform] duration-[var(--duration-base)] ease-out data-[state=closed]:duration-[var(--duration-fast)] data-[state=closed]:ease-in data-[state=open]:opacity-100",
            position === "center" &&
              "w-full rounded-t-[var(--radius-card)] rounded-b-none duration-[220ms] motion-safe:data-[state=closed]:translate-y-full motion-safe:data-[state=open]:translate-y-0 sm:w-[var(--dialog-w)] sm:rounded-card sm:duration-[var(--duration-base)] sm:motion-safe:data-[state=closed]:translate-y-2",
            position === "top" &&
              "w-[var(--dialog-w)] rounded-card motion-safe:data-[state=closed]:translate-y-2 motion-safe:data-[state=open]:translate-y-0",
            className
          )}
          {...props}
        >
          {position === "center" && (
            <span
              aria-hidden="true"
              className="-mt-2 mb-1 h-1 w-9 shrink-0 self-center rounded-pill bg-border sm:hidden"
            />
          )}
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label="Close"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-pill text-text-secondary transition-colors duration-[var(--duration-base)] ease-out hover:bg-surface-muted"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
}

// section 11.3 "Structure": title (20px/650), optional description, close button top-right.
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
  )
}

// Below sm the footer stacks with the primary action on top (section 11.3).
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-[20px] leading-tight font-[650] text-ink", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
