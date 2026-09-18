'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "General": studio name, email, phone, address,
// timezone. Validated by the one schema the domain layer publishes for this screen
// (domain/schemas/studio-settings.ts) - this form never re-derives its own rules.
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { generalSettingsSchema } from '@/domain/schemas';
import type { StudioSettings } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionCard } from '@/components/shared/section-card';

type GeneralValues = StudioSettings['general'];

interface GeneralSectionProps {
  general: GeneralValues;
  onSave: (changes: GeneralValues) => void;
}

// Curated demo list, not an exhaustive IANA zone picker - 'America/Bogota' is the seeded value
// (docs/05-MOCK-DATA-STRATEGY.md), the rest cover the studio-management demo's likely audience.
const TIMEZONE_OPTIONS = [
  { value: 'America/Bogota', label: 'Bogota (GMT-5)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
  { value: 'America/Denver', label: 'Denver (GMT-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
  { value: 'America/Mexico_City', label: 'Mexico City (GMT-6)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export function GeneralSection({ general, onSave }: GeneralSectionProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GeneralValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: general,
  });

  // The settings store is the source of truth (ADR-019); if it changes under an untouched form
  // (e.g. after this same save), follow it so the form never drifts from what was persisted.
  useEffect(() => {
    reset(general);
  }, [general, reset]);

  function onSubmit(values: GeneralValues) {
    onSave(values);
    toast.success('General settings saved.');
  }

  return (
    <SectionCard title="General">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.studioName}>
            <FieldLabel htmlFor="general-studio-name">Studio name</FieldLabel>
            <Input id="general-studio-name" aria-invalid={!!errors.studioName} {...register('studioName')} />
            {errors.studioName ? <FieldError>{errors.studioName.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="general-email">Email</FieldLabel>
            <Input id="general-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="general-phone">Phone</FieldLabel>
            <Input id="general-phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
            {errors.phone ? <FieldError>{errors.phone.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.timezone}>
            <FieldLabel htmlFor="general-timezone">Timezone</FieldLabel>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select name="timezone" value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="general-timezone" className="w-full">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.timezone ? <FieldError>{errors.timezone.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.address} className="md:col-span-2">
            <FieldLabel htmlFor="general-address">Address</FieldLabel>
            <Input id="general-address" aria-invalid={!!errors.address} {...register('address')} />
            {errors.address ? <FieldError>{errors.address.message}</FieldError> : null}
          </Field>
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
