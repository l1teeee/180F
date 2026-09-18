import { CalendarX2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Local stand-in for the shared EmptyState named in master plan section 51 - src/components/
// shared is owned by another agent right now, so this is built here and flagged for hoisting.
// docs/06-ROUTES-AND-SCREENS.md section 3.14 "Empty": a class/date combination with zero
// sessions, reachable at the tail of the advance-booking window (or, here, once every session
// left on a given day has already started).
export function BookingEmptyState({
  heading,
  description,
  actionLabel,
  onAction,
}: {
  heading: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <Card className="animate-fade-up items-center gap-4 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-chip bg-purple-xsoft text-purple-deep">
        <CalendarX2 className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] font-semibold text-ink">{heading}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Button type="button" variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    </Card>
  )
}
