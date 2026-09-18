"use client"

import type { CSSProperties } from "react"
import { ChevronLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/cn"
import { OCCUPANCY_STATE_STYLE } from "@/domain/constants"
import type { SessionWithOccupancy } from "@/domain/types"
import { formatDisplayTime } from "@/lib/dates"
import { ACCENT_BADGE_VARIANT } from "./accent-styles"
import { BookingEmptyState } from "./booking-empty-state"

// Master plan section 37's literal pattern: "6:00 AM  12 / 15 spots" / "6:00 PM  FULL". A full
// slot is disabled and labelled, never removed from the list (§37 "never silently missing").
export function TimeStep({
  dateLabel,
  sessions,
  selectedSessionId,
  onSelect,
  onBack,
}: {
  dateLabel: string
  sessions: SessionWithOccupancy[]
  selectedSessionId: string | null
  onSelect: (session: SessionWithOccupancy) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-1 text-sm font-semibold text-text-secondary transition-colors duration-[var(--duration-base)] ease-out hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Change date
        </button>
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          Choose a time
        </h1>
        <p className="text-sm text-text-secondary">{dateLabel}</p>
      </div>
      {sessions.length === 0 ? (
        <BookingEmptyState
          heading="No sessions available for this day"
          description="Every session on this day has already started, or none has been scheduled yet. Pick another date."
          actionLabel="Choose another date"
          onAction={onBack}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sessions.map((session, index) => {
            const isSelected = session.id === selectedSessionId
            const isFull = session.occupancyState === "full"
            const isAlmostFull = session.occupancyState === "almost_full"
            return (
              <button
                key={session.id}
                type="button"
                disabled={isFull}
                aria-pressed={isSelected}
                onClick={() => onSelect(session)}
                style={{ "--stagger-index": index } as CSSProperties}
                className={cn(
                  "animate-fade-up flex items-center justify-between gap-3 rounded-card border-2 bg-surface px-4 py-3.5 text-left shadow-card transition-[border-color,background-color] duration-[var(--duration-fast)] ease-out active:scale-[0.98] active:duration-[var(--duration-instant)]",
                  isFull
                    ? "cursor-not-allowed border-border opacity-60"
                    : isSelected
                      ? "cursor-pointer border-purple-deep bg-purple-xsoft"
                      : "cursor-pointer border-border hover:border-purple",
                )}
              >
                <span className="text-[15px] font-semibold text-ink">{formatDisplayTime(session.startTime)}</span>
                <span className="flex items-center gap-2">
                  {isAlmostFull && (
                    <Badge variant={ACCENT_BADGE_VARIANT[OCCUPANCY_STATE_STYLE.almost_full.accent]}>
                      {OCCUPANCY_STATE_STYLE.almost_full.label}
                    </Badge>
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isFull ? "text-danger-text" : "text-text-secondary",
                    )}
                  >
                    {isFull ? "FULL" : `${session.booked} / ${session.capacity} spots`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
