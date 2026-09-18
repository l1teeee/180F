import * as React from "react"

import { cn } from "@/lib/cn"

// docs/03 section 5 "Inputs": 40px, --radius-field, 1px --color-border, white, focus =
// --color-purple border. No focus ring here - the global :focus-visible outline (section 12.6)
// is the only ring, so this only changes border colour on focus.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-field border border-border bg-surface px-3 text-sm text-ink transition-colors duration-[var(--duration-base)] ease-out outline-none placeholder:text-text-tertiary focus:border-purple disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
