"use client"

import type { CSSProperties } from "react"
import { CalendarX2, ChevronLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/cn"
import { OCCUPANCY_STATE_STYLE } from "@/domain/constants"
import type { SessionWithOccupancy } from "@/domain/types"
import { useDateLocale } from "@/hooks/use-date-locale"
import { useMessages } from "@/hooks/use-messages"
import { ACCENT_BADGE_VARIANT } from "./accent-styles"

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
  const m = useMessages()
  const { formatDisplayTime } = useDateLocale()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onBack}
          className="relative flex w-fit items-center gap-1 text-sm font-semibold text-text-secondary transition-colors duration-[var(--duration-base)] ease-out before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {m.publicBooking.backToDate}
        </button>
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          {m.publicBooking.timeStep.heading}
        </h1>
        <p className="text-sm text-text-secondary">{dateLabel}</p>
      </div>
      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={m.publicBooking.timeStep.emptyState.title}
          description={m.publicBooking.timeStep.emptyState.description}
          action={{ label: m.publicBooking.timeStep.emptyState.action, onClick: onBack }}
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
                      {m.publicBooking.occupancyStateLabel.almost_full}
                    </Badge>
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isFull ? "text-danger-text" : "text-text-secondary",
                    )}
                  >
                    {isFull ? m.publicBooking.timeStep.full : m.publicBooking.timeStep.spotsLeft(session.booked, session.capacity)}
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
