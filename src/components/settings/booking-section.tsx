'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "Booking". Validated by the one schema the domain
// layer publishes for this screen (domain/schemas/studio-settings.ts). The schema stays
// locale-free, so each field maps its identity to a translated message at render instead of the
// schema's own English message text (same pattern as general-section.tsx / login-form.tsx).
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { bookingSettingsSchema } from '@/domain/schemas';
import type { StudioSettings } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectionCard } from '@/components/shared/section-card';
import { useMessages } from '@/hooks/use-messages';

type BookingValues = StudioSettings['booking'];

interface BookingSectionProps {
  booking: BookingValues;
  onSave: (changes: BookingValues) => void;
}

export function BookingSection({ booking, onSave }: BookingSectionProps) {
  const m = useMessages();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: booking,
  });

  useEffect(() => {
    reset(booking);
  }, [booking, reset]);

  function onSubmit(values: BookingValues) {
    onSave(values);
    toast.success(m.settings.booking.savedToast);
  }

  return (
    <SectionCard title={m.settings.booking.title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.cancellationWindowHours}>
            <FieldLabel htmlFor="booking-cancellation-window">{m.settings.booking.cancellationWindowLabel}</FieldLabel>
            <Input
              id="booking-cancellation-window"
              type="number"
              min={0}
              aria-invalid={!!errors.cancellationWindowHours}
              {...register('cancellationWindowHours', { valueAsNumber: true })}
            />
            {errors.cancellationWindowHours ? (
              <FieldError>{m.settings.booking.errors.cancellationWindowInvalid}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={!!errors.maxReservationsPerDay}>
            <FieldLabel htmlFor="booking-max-reservations">{m.settings.booking.maxReservationsLabel}</FieldLabel>
            <Input
              id="booking-max-reservations"
              type="number"
              min={1}
              aria-invalid={!!errors.maxReservationsPerDay}
              {...register('maxReservationsPerDay', { valueAsNumber: true })}
            />
            {errors.maxReservationsPerDay ? (
              <FieldError>{m.settings.booking.errors.maxReservationsInvalid}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={!!errors.advanceBookingDays}>
            <FieldLabel htmlFor="booking-advance-days">{m.settings.booking.advanceBookingLabel}</FieldLabel>
            <Input
              id="booking-advance-days"
              type="number"
              min={1}
              aria-invalid={!!errors.advanceBookingDays}
              {...register('advanceBookingDays', { valueAsNumber: true })}
            />
            {errors.advanceBookingDays ? <FieldError>{m.settings.booking.errors.advanceBookingInvalid}</FieldError> : null}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-field border border-border p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="booking-waitlist" className="text-sm font-medium text-ink">
              {m.settings.booking.waitlistLabel}
            </Label>
            <p className="text-sm text-text-secondary">{m.settings.booking.waitlistDescription}</p>
          </div>
          <Controller
            control={control}
            name="waitlistEnabled"
            render={({ field }) => (
              <Switch
                id="booking-waitlist"
                name="waitlistEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {m.settings.booking.saveButton}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
