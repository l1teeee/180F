"use client"

import { useEffect, useMemo, useRef } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useDemoStatus } from "@/hooks/use-demo-status"
import { usePublicBookingCatalog } from "@/hooks/use-public-booking-catalog"
import { usePublicBookingSessions } from "@/hooks/use-public-booking-sessions"
import { usePublicBookingWizard } from "@/hooks/use-public-booking-wizard"
import { formatDisplayDate } from "@/lib/dates"
import { BookingErrorState } from "./booking-error-state"
import { BookingSuccess } from "./booking-success"
import { ClassStep } from "./class-step"
import { CustomerStep } from "./customer-step"
import { DateStep } from "./date-step"
import { TimeStep } from "./time-step"
import { WizardProgress } from "./wizard-progress"

// The Phase 8 task brief's whole flow, wired together. Every number shown by a step comes from
// one of the use-public-booking-* hooks (which each call a domain selector); this component
// only routes between steps and never computes a count itself.
export function PublicBookingWizard({ initialClassId }: { initialClassId: string | null }) {
  const status = useDemoStatus()
  const wizard = usePublicBookingWizard(initialClassId)
  const classOptions = usePublicBookingCatalog()
  const { dates, sessionsByDate } = usePublicBookingSessions(wizard.selection.classType?.id ?? null)

  const sessionsForSelectedDate = useMemo(
    () => (wizard.selection.date ? (sessionsByDate.get(wizard.selection.date) ?? []) : []),
    [sessionsByDate, wizard.selection.date],
  )

  const stepRegionRef = useRef<HTMLDivElement>(null)
  const isFirstStepRenderRef = useRef(true)

  // A step change here is a searchParams update, not a document load, so nothing moves focus
  // or announces the new heading to a screen reader on its own the way a real page load would
  // (docs/03 section 10 "keyboard navigation" / master plan section 49). Skipped on the very
  // first render so mounting the wizard doesn't steal focus from wherever the visitor already
  // was; each step's <h1> carries tabIndex={-1} for exactly this programmatic-focus target.
  useEffect(() => {
    if (isFirstStepRenderRef.current) {
      isFirstStepRenderRef.current = false
      return
    }
    stepRegionRef.current?.querySelector("h1")?.focus()
  }, [wizard.step])

  return (
    <>
      {wizard.step <= 4 && <WizardProgress currentStep={wizard.step as 1 | 2 | 3 | 4} />}

      <div ref={stepRegionRef}>
        {status === "error" ? (
          <BookingErrorState />
        ) : status !== "ready" ? (
          <WizardLoadingSkeleton />
        ) : wizard.step === 2 && wizard.selection.classType ? (
          <DateStep
            classTypeName={wizard.selection.classType.name}
            dates={dates}
            selectedDate={wizard.selection.date}
            onSelect={wizard.selectDate}
            onBack={wizard.goBack}
          />
        ) : wizard.step === 3 && wizard.selection.date ? (
          <TimeStep
            dateLabel={formatDisplayDate(wizard.selection.date)}
            sessions={sessionsForSelectedDate}
            selectedSessionId={wizard.selection.session?.id ?? null}
            onSelect={wizard.selectSession}
            onBack={wizard.goBack}
          />
        ) : wizard.step === 4 && wizard.selection.classType && wizard.selection.session ? (
          <CustomerStep
            classType={wizard.selection.classType}
            session={wizard.selection.session}
            form={wizard.form}
            mutation={wizard.mutation}
            submitError={wizard.submitError}
            isSessionFullError={wizard.isSessionFullError}
            onSubmit={wizard.submitCustomerDetails}
            onBack={wizard.goBack}
            onChooseAnotherTime={wizard.chooseAnotherTime}
          />
        ) : wizard.step === 5 && wizard.confirmedBooking && wizard.confirmedSelection ? (
          // Built from confirmedBooking/confirmedSelection only - the frozen pair the wizard
          // hook sets together at the moment a submission actually succeeds - never from
          // `wizard.selection`, which keeps changing as the visitor moves through the wizard and
          // would otherwise let a later selection change show through on a confirmation for an
          // earlier, already-committed booking.
          <BookingSuccess
            booking={wizard.confirmedBooking}
            classType={wizard.confirmedSelection.classType}
            session={wizard.confirmedSelection.session}
            onBookAnother={wizard.startOver}
          />
        ) : (
          // step === 1, or a URL/selection combination that doesn't support any later step -
          // maxReachableStep in the wizard hook already guarantees this is always the correct
          // fallback (never a class/date/time picked without the data to show it).
          <ClassStep
            options={classOptions}
            selectedClassId={wizard.selection.classType?.id ?? null}
            onSelect={wizard.selectClass}
          />
        )}
      </div>
    </>
  )
}

// docs/06-ROUTES-AND-SCREENS.md section 3.14 "Loading": each step's data-bearing region shows
// LoadingSkeleton while status !== 'ready'. The step chrome (shell, progress bar) above already
// renders immediately since it needs no hydrated data; only the content region is gated here.
function WizardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-7 w-48" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>
    </div>
  )
}
