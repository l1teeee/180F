'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4 "New booking flow" + docs/03-DESIGN-SYSTEM.md
// section 11.4-A "Form dialog". Real customer/class/date/time/instructor data driving the exact
// pattern already proven in
// src/app/design-system/_components/overlays/booking-dialog.tsx + occupancy-strip.tsx.
import { useEffect, useId, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { newBookingInputSchema, type NewBookingInputSchema } from '@/domain/schemas';
import { useBookingsSessionOptions } from '@/hooks/use-bookings-session-options';
import { formatDisplayDate, formatDisplayTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useInstructorStore } from '@/stores/instructor.store';

export interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: NewBookingInputSchema = { customerId: '', sessionId: '', source: 'reception', status: undefined };

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const idPrefix = useId();
  const customers = useCustomerStore((state) => state.customers);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);
  const mutation = useBookingStore((state) => state.mutation);

  const [selectedClassTypeId, setSelectedClassTypeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { dates, sessionsByDate } = useBookingsSessionOptions(selectedClassTypeId);
  const sessionsForDate = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];

  const sortedCustomers = useMemo(() => [...customers].sort((a, b) => a.name.localeCompare(b.name)), [customers]);

  const form = useForm<NewBookingInputSchema>({
    resolver: zodResolver(newBookingInputSchema),
    defaultValues: EMPTY_VALUES,
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = form;

  // useWatch (a proper subscription hook), not form.watch() - the latter is an imperative
  // escape hatch React Compiler cannot safely memoize around.
  const sessionId = useWatch({ control, name: 'sessionId' });
  const selectedSession = sessionsForDate.find((session) => session.id === sessionId) ?? null;
  const selectedClassType = classTypes.find((classType) => classType.id === selectedClassTypeId) ?? null;
  const selectedInstructor = selectedSession
    ? (instructors.find((instructor) => instructor.id === selectedSession.instructorId) ?? null)
    : null;

  const isFull = selectedSession?.occupancyState === 'full';
  const isPending = mutation === 'pending' || isSubmitting;

  function resetDialog() {
    reset(EMPTY_VALUES);
    setSelectedClassTypeId(null);
    setSelectedDate(null);
    setSubmitError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetDialog();
    onOpenChange(next);
  }

  // Every ancestor of the currently chosen session that changes invalidates it - matching the
  // public wizard's own "picking an earlier step clears everything after it" rule.
  useEffect(() => {
    setValue('sessionId', '', { shouldValidate: false });
  }, [selectedClassTypeId, selectedDate, setValue]);

  // No client-side reentrancy lock: the button is disabled while isPending, and ADR-017's
  // serialize()+re-check inside createBooking is the actual, structural guarantee that two fast
  // consecutive submissions can never push booked past capacity (docs/08-STATE-MANAGEMENT.md
  // section 8.1) - a duplicate call here would only ever be rejected (already_booked or
  // session_full), never double-book.
  async function onSubmit(values: NewBookingInputSchema) {
    if (!selectedSession) return;
    setSubmitError(null);
    const result = await useBookingStore.getState().createBooking({
      customerId: values.customerId,
      sessionId: values.sessionId,
      source: 'reception',
      status: isFull ? 'waitlist' : 'confirmed',
    });
    if (result.ok) {
      toast.success('Booking created successfully');
      handleOpenChange(false);
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
          <DialogDescription>Reserve a spot for a customer in an upcoming class.</DialogDescription>
        </DialogHeader>

        {/* DialogContent is a fixed-height flex column capped at 85vh with overflow-hidden
            (src/components/ui/dialog.tsx, docs/03 section 11.2 "max height 85vh, body scrolls,
            header and footer stay fixed") - without this form itself shrinking (min-h-0) and an
            inner overflow-y-auto region, a tall form like this one (five fields plus the
            capacity strip) simply got clipped, with the footer's submit button unreachable. */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-5 overflow-y-auto px-0.5 py-0.5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.customerId}>
                <FieldLabel htmlFor={`${idPrefix}-customer`}>Customer</FieldLabel>
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`${idPrefix}-customer`} autoFocus aria-invalid={!!errors.customerId} className="w-full">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.customerId ? [errors.customerId] : undefined} />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${idPrefix}-class`}>Class</FieldLabel>
                <Select
                  // '' (never undefined) so this stays a controlled Radix Select across the
                  // reset - Radix.Select treats a value prop of undefined as "uncontrolled" and
                  // falls back to whatever it last rendered internally, which is exactly the
                  // stale-value bug this dialog must not have.
                  value={selectedClassTypeId ?? ''}
                  onValueChange={(value) => {
                    setSelectedClassTypeId(value);
                    setSelectedDate(null);
                  }}
                >
                  <SelectTrigger id={`${idPrefix}-class`} className="w-full">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((classType) => (
                      <SelectItem key={classType.id} value={classType.id}>
                        {classType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`${idPrefix}-date`}>Date</FieldLabel>
                <Select
                  // Same reason as the Class select above: '' keeps this controlled through the
                  // reset to null, so the trigger actually shows the "Select a date" placeholder
                  // instead of the previous class's stale date text.
                  value={selectedDate ?? ''}
                  onValueChange={(value) => setSelectedDate(value)}
                  disabled={!selectedClassTypeId || dates.length === 0}
                >
                  <SelectTrigger id={`${idPrefix}-date`} className="w-full">
                    <SelectValue placeholder={selectedClassTypeId ? 'Select a date' : 'Select a class first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {dates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {formatDisplayDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field data-invalid={!!errors.sessionId}>
                <FieldLabel htmlFor={`${idPrefix}-time`}>Time</FieldLabel>
                <Controller
                  control={control}
                  name="sessionId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedDate || sessionsForDate.length === 0}>
                      <SelectTrigger id={`${idPrefix}-time`} aria-invalid={!!errors.sessionId} className="w-full">
                        <SelectValue placeholder={selectedDate ? 'Select a time' : 'Select a date first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionsForDate.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {formatDisplayTime(session.startTime)} &middot;{' '}
                            {session.occupancyState === 'full' ? 'FULL' : `${session.booked}/${session.capacity} spots`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.sessionId ? [errors.sessionId] : undefined} />
              </Field>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-secondary">Instructor</span>
              {/* Not a form control - a derived, read-only fact about the selected session
                  (docs/03 section 11.4-A), so it carries no name/register/Controller binding. */}
              <div className="flex h-10 items-center justify-between rounded-field border border-border bg-surface-muted px-3 text-sm text-ink">
                <span>{selectedInstructor?.name ?? '—'}</span>
                <span className="text-xs text-text-tertiary">Derived from class</span>
              </div>
            </div>

            {selectedSession && selectedClassType ? (
              <div className="flex flex-col gap-2.5 rounded-card-sm border border-border-soft bg-canvas-wash p-3.5">
                <div className="flex items-center gap-3">
                  <OccupancyBar rate={selectedSession.occupancyRate} accent={selectedClassType.accent} showPercentage={false} />
                  <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
                    {selectedSession.booked} / {selectedSession.capacity} spots reserved
                  </span>
                </div>
                {selectedSession.occupancyState !== 'available' ? (
                  <div>
                    <StatusBadge status={selectedSession.occupancyState} />
                  </div>
                ) : null}
                {isFull ? (
                  <p className="text-sm text-text-secondary">
                    This class is full. Join the waitlist and we will reach out the moment a spot opens.
                  </p>
                ) : null}
              </div>
            ) : null}

            {submitError ? (
              <div
                role="alert"
                className="rounded-field border border-danger-soft bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger-text"
              >
                {submitError}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" disabled={isPending} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {isFull ? 'Join waitlist' : 'Reserve booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
