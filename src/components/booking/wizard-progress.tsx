import { cn } from "@/lib/cn"
import { useMessages } from "@/hooks/use-messages"

// docs/06-ROUTES-AND-SCREENS.md section 3.14: "WizardProgress (4-step indicator) sits above
// the step content on every step." A plain colour transition (already how Input/Button signal
// focus and hover in this codebase) rather than a transform - this is step-navigation chrome,
// not the booking numbers docs/03 section 12.3 rule 2 forbids animating.
export function WizardProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const m = useMessages()
  const steps = [
    { n: 1, label: m.publicBooking.progress.steps.class },
    { n: 2, label: m.publicBooking.progress.steps.date },
    { n: 3, label: m.publicBooking.progress.steps.time },
    { n: 4, label: m.publicBooking.progress.steps.details },
  ] as const

  return (
    <ol aria-label={m.publicBooking.progress.ariaLabel} className="flex items-center gap-2 pb-6 pt-2">
      {steps.map((step) => {
        const state = step.n < currentStep ? "done" : step.n === currentStep ? "current" : "upcoming"
        return (
          <li
            key={step.n}
            className="flex flex-1 flex-col gap-1.5"
            aria-current={state === "current" ? "step" : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-1.5 rounded-pill transition-colors duration-[var(--duration-base)] ease-out",
                state === "upcoming" ? "bg-border" : "bg-purple-deep",
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold",
                state === "upcoming" ? "text-text-tertiary" : "text-ink",
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
