import * as React from "react"

import { cn } from "@/lib/cn"

// docs/03 section 5 "Card": white surface, --radius-card, 1px border, --shadow-card. Nested /
// secondary cards use --radius-card-sm (18px) and the smaller 18px padding (section 3 "Card
// padding: 24px (main), 18px (secondary)") via size="sm".
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "flex flex-col gap-6 border border-border bg-card p-6 text-card-foreground shadow-card data-[size=default]:rounded-card data-[size=sm]:gap-4 data-[size=sm]:rounded-card-sm data-[size=sm]:p-[18px]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-start justify-between gap-4 [.border-b]:border-border [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

// h2: section titles (e.g. "Weekly bookings", "General") sit directly under a page's own h1
// (PageHeader) with no intervening heading, so h2 is the correct level - a plain div here left
// every section title unreachable by heading navigation. Visible style is unchanged; only the
// element changes.
function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-[20px] leading-tight font-[650] text-ink", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center border-t border-border pt-5", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
