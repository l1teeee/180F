"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/cn"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim opacity-0 backdrop-blur-[2px] transition-opacity duration-[var(--duration-fast)] ease-out data-[state=open]:opacity-100",
        className
      )}
      {...props}
    />
  )
}

// docs/03 section 11.4-C "Side sheet": inset 12px from the viewport edges so it floats like every
// other card, all four corners at 24px. Enters with a 220ms translateX(100%)->0 (section 11.5);
// 220ms has no matching --duration-* token, it is the doc's own literal value for this pattern.
const SHEET_SIDE_CLASSNAME: Record<"top" | "right" | "bottom" | "left", string> = {
  right:
    "inset-y-3 right-3 h-[calc(100%-24px)] w-[420px] max-w-[calc(100vw-24px)] data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
  left: "inset-y-3 left-3 h-[calc(100%-24px)] w-[420px] max-w-[calc(100vw-24px)] data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
  top: "inset-x-3 top-3 h-auto max-h-[85vh] data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
  bottom:
    "inset-x-3 bottom-3 h-auto max-h-[85vh] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 rounded-card border border-border bg-surface p-6 text-sm text-ink shadow-modal outline-none transition-transform duration-[220ms] ease-out data-[state=closed]:duration-[var(--duration-fast)] data-[state=closed]:ease-in",
          SHEET_SIDE_CLASSNAME[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            aria-label="Close"
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-pill text-text-secondary transition-colors duration-[var(--duration-base)] ease-out hover:bg-surface-muted"
          >
            <X aria-hidden="true" className="h-[18px] w-[18px]" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-3 border-t border-border pt-5", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[20px] leading-tight font-[650] text-ink", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
