"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/cn"

// docs/03 section 12.2 pattern 15 "Switch knob": translateX, 160ms, --ease-emphasis - one of
// the two places that easing is permitted (section 12.1). 160ms has no matching named
// --duration-* token, so it is the doc's own literal value, not an invented one.
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[22px] w-9 shrink-0 items-center rounded-pill border border-border bg-surface-muted transition-colors duration-[var(--duration-base)] ease-out data-checked:border-transparent data-checked:bg-purple-deep disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[18px] rounded-pill bg-surface shadow-card transition-transform duration-[160ms] ease-emphasis data-checked:translate-x-[18px] data-unchecked:translate-x-[2px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
