import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/cn"

// docs/03 section 5 "Buttons". Every variant is 40px tall (section 3 "controls 40px tall") so
// there is no size prop - icon is its own variant because it is inherently square, not a size
// of the others. Focus never draws its own ring here: the global :focus-visible outline in
// globals.css (section 12.6) is the only focus indicator, so no variant carries
// focus-visible:ring-* or an outline override.
const buttonVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-[opacity,box-shadow,background-color] duration-[var(--duration-base)] ease-out active:scale-[0.98] active:duration-[var(--duration-instant)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // White on --color-purple is 4.40:1 and fails AA, so the fill is the deeper token
        // (ADR-020) - never plain purple.
        primary: "rounded-field bg-purple-deep px-5 text-white hover:opacity-90",
        // The single hero CTA per screen (docs/03 5 "Ink").
        ink: "rounded-pill bg-ink px-5 text-white hover:opacity-90",
        secondary:
          "rounded-field border border-border bg-surface px-5 text-ink shadow-card hover:shadow-raise",
        ghost: "rounded-field px-5 text-text-secondary hover:bg-surface-muted",
        // 40px circle, white, 1px border, hover shadow-raise.
        icon: "w-10 rounded-pill border border-border bg-surface text-ink hover:shadow-raise",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
