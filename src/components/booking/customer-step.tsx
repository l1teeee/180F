"use client"

import { ChevronLeft, Loader2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/cn"
import type { PublicBookingInputSchema } from "@/domain/schemas"
import type { BookingRejectionReason } from "@/domain/selectors"
import type { ClassType, SessionWithOccupancy } from "@/domain/types"
import { useDateLocale } from "@/hooks/use-date-locale"
import { useMessages } from "@/hooks/use-messages"
import { ACCENT_ICON_BG_CLASS, ClassIcon } from "@/components/shared/class-icon"

// Master plan section 38: fields Name, Phone, Email, in that order, validated by the existing
// publicBookingInputSchema (React Hook Form + Zod - "Allow realistic demo input"). `noValidate`
// hands validation entirely to that schema rather than letting the browser's own constraint
// validation (native `type="email"` popups) run first and hide the field-level message this
// step is required to announce.
export function CustomerStep({
  classType,
  session,
  form,
  mutation,
  submitErrorReason,
  onSubmit,
  onBack,
  onChooseAnotherTime,
}: {
  classType: ClassType
  session: SessionWithOccupancy
  form: UseFormReturn<PublicBookingInputSchema>
  mutation: "idle" | "pending"
  // Set exactly when the last submit was rejected, to the store action's own stable `reason`
  // CODE (useBookingStore().createPublicBooking(), this namespace's write set) - never a
  // sentence. m.publicBooking.customerStep.errors.forReason maps it to copy below.
  submitErrorReason: BookingRejectionReason | null
  onSubmit: (values: PublicBookingInputSchema) => void
  onBack: () => void
  onChooseAnotherTime: () => void
}) {
  const m = useMessages()
  const { formatDisplayDate, formatDisplayTime } = useDateLocale()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  const isPending = mutation === "pending" || isSubmitting

  // publicBookingInputSchema (src/domain/schemas/public-booking-input.ts) is outside this
  // namespace's write set and its messages are never rendered - each field has exactly one
  // possible zod failure, so field identity alone picks the translated key (see
  // src/i18n/dictionaries/es/publicBooking.ts).
  const nameError = errors.name ? m.publicBooking.customerStep.errors.nameTooShort : undefined
  const emailError = errors.email ? m.publicBooking.customerStep.errors.emailInvalid : undefined
  const phoneError = errors.phone ? m.publicBooking.customerStep.errors.phoneTooShort : undefined

  const isSessionFullError = submitErrorReason === "session_full"
  const submitErrorText = submitErrorReason ? m.publicBooking.customerStep.errors.forReason(submitErrorReason) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={onBack}
          className="relative flex w-fit items-center gap-1 text-sm font-semibold text-text-secondary transition-colors duration-[var(--duration-base)] ease-out before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:text-ink disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {m.publicBooking.backToTime}
        </button>
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          {m.publicBooking.customerStep.heading}
        </h1>
      </div>

      <Card size="sm" className="flex-row items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-chip",
            ACCENT_ICON_BG_CLASS[classType.accent],
          )}
        >
          <ClassIcon name={classType.icon} className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-ink">{classType.name}</span>
          <span className="text-sm text-text-secondary">
            {formatDisplayDate(session.date)} &middot; {formatDisplayTime(session.startTime)}
          </span>
        </div>
      </Card>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <input type="hidden" {...register("sessionId")} />

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="public-booking-name">{m.publicBooking.customerStep.nameLabel}</FieldLabel>
          <Input
            id="public-booking-name"
            autoComplete="name"
            placeholder={m.publicBooking.customerStep.namePlaceholder}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "public-booking-name-error" : undefined}
            {...register("name")}
          />
          {nameError ? <FieldError id="public-booking-name-error">{nameError}</FieldError> : null}
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="public-booking-phone">{m.publicBooking.customerStep.phoneLabel}</FieldLabel>
          <Input
            id="public-booking-phone"
            type="tel"
            autoComplete="tel"
            placeholder={m.publicBooking.customerStep.phonePlaceholder}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "public-booking-phone-error" : undefined}
            {...register("phone")}
          />
          {phoneError ? <FieldError id="public-booking-phone-error">{phoneError}</FieldError> : null}
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="public-booking-email">{m.publicBooking.customerStep.emailLabel}</FieldLabel>
          <Input
            id="public-booking-email"
            type="email"
            autoComplete="email"
            placeholder={m.publicBooking.customerStep.emailPlaceholder}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "public-booking-email-error" : undefined}
            {...register("email")}
          />
          {emailError ? <FieldError id="public-booking-email-error">{emailError}</FieldError> : null}
        </Field>

        {submitErrorText && (
          <div
            role="alert"
            className="flex flex-col gap-1.5 rounded-field border border-danger-soft bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger-text"
          >
            <span>{submitErrorText}</span>
            {isSessionFullError && (
              <button
                type="button"
                onClick={onChooseAnotherTime}
                className="relative w-fit font-semibold underline underline-offset-2 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
              >
                {m.publicBooking.customerStep.chooseAnotherTime}
              </button>
            )}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {m.publicBooking.customerStep.submit}
        </Button>
      </form>
    </div>
  )
}
