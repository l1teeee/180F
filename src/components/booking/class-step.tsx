"use client"

import type { CSSProperties } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/cn"
import type { ClassType } from "@/domain/types"
import type { PublicClassOption } from "@/hooks/use-public-booking-catalog"
import { ACCENT_ICON_BG_CLASS, ClassIcon } from "@/components/shared/class-icon"
import { useMessages } from "@/hooks/use-messages"

// Master plan section 35: card content is icon, duration, short description, available
// sessions - one native <button> per card (not a div+onClick) so the whole 40px+ target is
// keyboard-operable for free, with no extra role/tabindex bookkeeping.
export function ClassStep({
  options,
  selectedClassId,
  onSelect,
}: {
  options: PublicClassOption[]
  selectedClassId: string | null
  onSelect: (classType: ClassType) => void
}) {
  const m = useMessages()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          {m.publicBooking.classStep.heading}
        </h1>
        <p className="text-sm text-text-secondary">{m.publicBooking.classStep.subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">
        {options.map((option, index) => {
          const isSelected = option.classType.id === selectedClassId
          const isDisabled = option.availableSessionCount === 0
          return (
            <button
              key={option.classType.id}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => onSelect(option.classType)}
              style={{ "--stagger-index": index } as CSSProperties}
              className={cn(
                "animate-fade-up relative flex items-center gap-4 rounded-card border-2 bg-surface p-4 text-left shadow-card transition-[transform,box-shadow,border-color,background-color] duration-[var(--duration-fast)] ease-out active:scale-[0.98] active:duration-[var(--duration-instant)]",
                isDisabled
                  ? "cursor-not-allowed border-border opacity-50"
                  : isSelected
                    ? "cursor-pointer border-purple-deep bg-purple-xsoft"
                    : "cursor-pointer border-border hover:-translate-y-0.5 hover:shadow-raise",
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-chip",
                  ACCENT_ICON_BG_CLASS[option.classType.accent],
                )}
              >
                <ClassIcon name={option.classType.icon} className="size-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-ink">{option.classType.name}</span>
                <span className="truncate text-sm text-text-secondary">{option.classType.description}</span>
                <span className="text-xs font-semibold text-text-secondary">
                  {m.publicBooking.classStep.durationMinutes(option.classType.durationMinutes)}
                  {" · "}
                  {isDisabled
                    ? m.publicBooking.classStep.noSessionsAvailable
                    : m.publicBooking.classStep.sessionsAvailable(option.availableSessionCount)}
                </span>
              </div>
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-purple-deep text-white"
                >
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
