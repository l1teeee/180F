import { cn } from "@/lib/cn"

const STEPS = [
  { n: 1, label: "Class" },
  { n: 2, label: "Date" },
  { n: 3, label: "Time" },
  { n: 4, label: "Details" },
] as const

// docs/06-ROUTES-AND-SCREENS.md section 3.14: "WizardProgress (4-step indicator) sits above
// the step content on every step." A plain colour transition (already how Input/Button signal
// focus and hover in this codebase) rather than a transform - this is step-navigation chrome,
// not the booking numbers docs/03 section 12.3 rule 2 forbids animating.
export function WizardProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <ol aria-label="Booking steps" className="flex items-center gap-2 pb-6 pt-2">
      {STEPS.map((step) => {
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
