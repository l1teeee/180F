'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "Booking". Validated by the one schema the domain
// layer publishes for this screen (domain/schemas/studio-settings.ts).
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

type BookingValues = StudioSettings['booking'];

interface BookingSectionProps {
  booking: BookingValues;
  onSave: (changes: BookingValues) => void;
}

export function BookingSection({ booking, onSave }: BookingSectionProps) {
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
    toast.success('Booking settings saved.');
  }

  return (
    <SectionCard title="Booking">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.cancellationWindowHours}>
            <FieldLabel htmlFor="booking-cancellation-window">Cancellation window (hours)</FieldLabel>
            <Input
              id="booking-cancellation-window"
              type="number"
              min={0}
              aria-invalid={!!errors.cancellationWindowHours}
              {...register('cancellationWindowHours', { valueAsNumber: true })}
            />
            {errors.cancellationWindowHours ? <FieldError>{errors.cancellationWindowHours.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.maxReservationsPerDay}>
            <FieldLabel htmlFor="booking-max-reservations">Max reservations per day</FieldLabel>
            <Input
              id="booking-max-reservations"
              type="number"
              min={1}
              aria-invalid={!!errors.maxReservationsPerDay}
              {...register('maxReservationsPerDay', { valueAsNumber: true })}
            />
            {errors.maxReservationsPerDay ? <FieldError>{errors.maxReservationsPerDay.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.advanceBookingDays}>
            <FieldLabel htmlFor="booking-advance-days">Advance booking period (days)</FieldLabel>
            <Input
              id="booking-advance-days"
              type="number"
              min={1}
              aria-invalid={!!errors.advanceBookingDays}
              {...register('advanceBookingDays', { valueAsNumber: true })}
            />
            {errors.advanceBookingDays ? <FieldError>{errors.advanceBookingDays.message}</FieldError> : null}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-field border border-border p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="booking-waitlist" className="text-sm font-medium text-ink">
              Waitlist enabled
            </Label>
            <p className="text-sm text-text-secondary">
              Let customers join a full class and get promoted when a spot opens.
            </p>
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
            Save changes
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
