import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/cn"

// docs/03 section 5 "Pills and badges": 26px tall, --radius-pill, 12px/600, 10px horizontal
// padding, one of five status tones. Status is always icon-or-shape plus text, never colour
// alone (section 10) - callers pass an icon as a child alongside the label.
const badgeVariants = cva(
  "inline-flex h-[26px] w-fit shrink-0 items-center justify-center gap-1.5 rounded-pill px-2.5 text-xs font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        positive: "bg-green-soft text-green-text",
        pending: "bg-yellow-soft text-yellow-text",
        danger: "bg-danger-soft text-danger-text",
        neutralBrand: "bg-purple-xsoft text-purple-deep",
        info: "bg-blue-soft text-blue-text",
      },
    },
    defaultVariants: {
      variant: "neutralBrand",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
