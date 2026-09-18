"use client"

import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/cn"
import type { ISODate } from "@/domain/types"
import type { PublicDateOption } from "@/hooks/use-public-booking-sessions"

// Master plan section 36: horizontal date selector, selected state unmistakable, days with no
// availability visibly unavailable. Unavailable days are `disabled` (native, non-colour
// semantics) and struck through, not hidden - consistent with how a full time slot is handled
// in time-step.tsx rather than silently removed (docs/03 section 10, "no interaction that
// depends exclusively on colour").
export function DateStep({
  classTypeName,
  dates,
  selectedDate,
  onSelect,
  onBack,
}: {
  classTypeName: string
  dates: PublicDateOption[]
  selectedDate: ISODate | null
  onSelect: (date: ISODate) => void
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
          Change class
        </button>
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          Choose a date
        </h1>
        <p className="text-sm text-text-secondary">{classTypeName} &middot; pick the day that works for you.</p>
      </div>
      <div
        role="group"
        aria-label="Available dates"
        className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 min-[768px]:-mx-6 min-[768px]:px-6 min-[1024px]:mx-0 min-[1024px]:px-0"
      >
        {dates.map((option) => {
          const isSelected = option.date === selectedDate
          return (
            <button
              key={option.date}
              type="button"
              disabled={!option.available}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.date)}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-pill border-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-[var(--duration-fast)] ease-out active:scale-[0.98] active:duration-[var(--duration-instant)]",
                !option.available
                  ? "cursor-not-allowed border-border text-text-tertiary line-through"
                  : isSelected
                    ? "cursor-pointer border-purple-deep bg-purple-deep text-white"
                    : "cursor-pointer border-border bg-surface text-ink hover:border-purple",
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
