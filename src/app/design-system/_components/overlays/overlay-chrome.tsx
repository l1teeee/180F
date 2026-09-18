"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export const FIELD_CLASSNAME =
  "h-10 rounded-field border border-border bg-surface px-3 text-sm text-ink focus:border-purple";
export const FIELD_LABEL_CLASSNAME = "text-xs font-semibold text-text-secondary";

// Shared outer chrome for the patterns built as a centred/anchored "card" (docs/03 11.2): white
// surface, 24px radius, 1px border, shadow-modal, max-height 85vh so a tall body scrolls while
// header/footer stay fixed. The sheet (C) and bottom sheet (D) use their own chrome instead -
// different radii and edge rules - so they do not call this helper.
//
// Width is a definite length via min(), not w-full + max-w-*: the live version's card sits inside
// a native <dialog> that is deliberately left at its UA-default width: fit-content (so it centres
// itself), and a percentage width inside a fit-content ancestor is the classic CSS sizing
// ambiguity - min() gives every browser one definite number to resolve instead.
export function overlayCardClassName(widthPx: number): string {
  return `flex max-h-[85vh] w-[min(${widthPx}px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-modal`;
}

interface OverlayHeaderProps {
  title: string;
  titleId?: string;
  description?: string;
  descriptionId?: string;
  onClose?: () => void;
  /** The confirm dialog's danger-tinted icon square (docs/03 11.4-B) - the only pattern that uses one. */
  icon?: LucideIcon;
  /** The message preview's non-removable "Simulated" pill (docs/03 11.4-F) - the only pattern that uses one. */
  badge?: ReactNode;
}

// docs/03 section 11.3 "Structure" - shared by every pattern so a booking dialog and a
// cancellation confirm read as the same product. The close button is always rendered when
// onClose is provided: closing is never available only via the scrim (docs/03 section 11.6).
export function OverlayHeader({
  title,
  titleId,
  description,
  descriptionId,
  onClose,
  icon: Icon,
  badge,
}: OverlayHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        {Icon ? (
          <span
            aria-hidden="true"
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-chip bg-danger-soft text-danger-deep"
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 id={titleId} className="text-[20px] leading-tight font-[650] text-ink">
            {title}
          </h3>
          {badge}
        </div>
        {description ? (
          <p id={descriptionId} className="text-sm text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-text-secondary transition-colors duration-200 hover:bg-surface-muted"
        >
          <X aria-hidden="true" className="h-[18px] w-[18px]" />
        </button>
      ) : null}
    </header>
  );
}

interface OverlayFooterProps {
  children: ReactNode;
  /** Bottom sheet only - it IS the mobile form, so its footer is always stacked, never a row. */
  forceStacked?: boolean;
}

// "Below sm the footer becomes a full-width stack with the primary action on top, because a
// thumb reaches the bottom of the screen first" (docs/03 11.3). flex-col-reverse + sm:flex-row is
// what makes that true: reversed, DOM order [secondary, primary] paints primary first (on top)
// once stacked, and un-reverses to secondary-left-of-primary once there is room for a row.
export function OverlayFooter({ children, forceStacked = false }: OverlayFooterProps) {
  return (
    <footer
      className={`flex flex-col-reverse gap-3 border-t border-border pt-5 ${
        forceStacked ? "" : "sm:flex-row sm:items-center sm:justify-end"
      }`}
    >
      {children}
    </footer>
  );
}

export type OverlayButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

const BUTTON_VARIANT_CLASSNAME: Record<OverlayButtonVariant, string> = {
  // docs/03 section 5 "Buttons": purple-deep is the fill (not plain purple), because white text
  // on --color-purple measures 4.40:1 and fails AA. The doc's literal hover token (#4E40A8) is a
  // new hex value outside this task's globals.css allowance, so hover reuses the opacity dip the
  // existing Ink button on this same page already established instead of adding one.
  primary: "bg-purple-deep text-white hover:opacity-90",
  secondary: "border border-border bg-surface text-ink shadow-card hover:shadow-raise",
  destructive: "bg-danger-deep text-white hover:opacity-90",
  ghost: "text-text-secondary hover:bg-surface-muted",
};

interface OverlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: OverlayButtonVariant;
}

export function OverlayButton({ variant, className = "", children, ...rest }: OverlayButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-field px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 ${BUTTON_VARIANT_CLASSNAME[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
