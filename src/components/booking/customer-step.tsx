"use client"

import { ChevronLeft, Loader2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/cn"
import type { PublicBookingInputSchema } from "@/domain/schemas"
import type { ClassType, SessionWithOccupancy } from "@/domain/types"
import { formatDisplayDate, formatDisplayTime } from "@/lib/dates"
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
  submitError,
  isSessionFullError,
  onSubmit,
  onBack,
  onChooseAnotherTime,
}: {
  classType: ClassType
  session: SessionWithOccupancy
  form: UseFormReturn<PublicBookingInputSchema>
  mutation: "idle" | "pending"
  submitError: string | null
  // Whether `submitError` was specifically a session_full rejection - tracked by the wizard
  // hook from the store action's actual result, not re-derived from `session.occupancyState`
  // here: that prop is a snapshot taken at step 3 (docs/06 section 3.15) and does not
  // live-update when a later submit finds the session has since filled up.
  isSessionFullError: boolean
  onSubmit: (values: PublicBookingInputSchema) => void
  onBack: () => void
  onChooseAnotherTime: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  const isPending = mutation === "pending" || isSubmitting

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
          Change time
        </button>
        <h1 tabIndex={-1} className="text-[22px] font-bold tracking-tight text-ink outline-none">
          Your details
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
          <FieldLabel htmlFor="public-booking-name">Name</FieldLabel>
          <Input
            id="public-booking-name"
            autoComplete="name"
            placeholder="Jordan Rivera"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "public-booking-name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="public-booking-name-error" errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="public-booking-phone">Phone</FieldLabel>
          <Input
            id="public-booking-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 000 0000"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "public-booking-phone-error" : undefined}
            {...register("phone")}
          />
          <FieldError id="public-booking-phone-error" errors={errors.phone ? [errors.phone] : undefined} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="public-booking-email">Email</FieldLabel>
          <Input
            id="public-booking-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "public-booking-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="public-booking-email-error" errors={errors.email ? [errors.email] : undefined} />
        </Field>

        {submitError && (
          <div
            role="alert"
            className="flex flex-col gap-1.5 rounded-field border border-danger-soft bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger-text"
          >
            <span>{submitError}</span>
            {isSessionFullError && (
              <button
                type="button"
                onClick={onChooseAnotherTime}
                className="relative w-fit font-semibold underline underline-offset-2 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
              >
                Choose a different time
              </button>
            )}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          Confirm reservation
        </Button>
      </form>
    </div>
  )
}
