"use client"

import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheck, Info, TriangleAlert, OctagonX, Loader2 } from "lucide-react"

// ADR-011: light theme only, so this never reads next-themes - the doc's own duration (auto-
// dismiss at 4s, docs/03 section 12.2 pattern 10) is the default; --border-radius and the colour
// vars below are the shadcn/ui bridge tokens (docs/03 section 9), not new hex values.
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheck aria-hidden="true" className="size-4" />,
        info: <Info aria-hidden="true" className="size-4" />,
        warning: <TriangleAlert aria-hidden="true" className="size-4" />,
        error: <OctagonX aria-hidden="true" className="size-4" />,
        loading: <Loader2 aria-hidden="true" className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-card-sm)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "shadow-card text-sm",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
