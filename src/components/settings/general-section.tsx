'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "General": studio name, email, phone, address,
// timezone. Validated by the one schema the domain layer publishes for this screen
// (domain/schemas/studio-settings.ts) - this form never re-derives its own rules. The schema
// stays locale-free (a module-scope schema can't call useMessages()), so every field maps its
// identity to a translated message at render instead of showing the schema's own English message
// text - same pattern as login-form.tsx / src/i18n/dictionaries/es/auth.ts.
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
import { useMessages } from '@/hooks/use-messages';
import { LOCALE_LABELS, LOCALES } from '@/i18n/locales';
import { useLocaleStore } from '@/stores/locale.store';

type GeneralValues = StudioSettings['general'];

interface GeneralSectionProps {
  general: GeneralValues;
  onSave: (changes: GeneralValues) => void;
}

// Curated demo list, not an exhaustive IANA zone picker - 'America/Bogota' is the seeded value
// (docs/05-MOCK-DATA-STRATEGY.md), the rest cover the studio-management demo's likely audience.
// Keyed by IANA id; the labels shown to the viewer come from m.settings.general.timezoneOptions.
const TIMEZONE_IDS = [
  'America/Bogota',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
] as const;

export function GeneralSection({ general, onSave }: GeneralSectionProps) {
  const m = useMessages();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
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
    toast.success(m.settings.general.savedToast);
  }

  return (
    <SectionCard title={m.settings.general.title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.studioName}>
            <FieldLabel htmlFor="general-studio-name">{m.settings.general.studioNameLabel}</FieldLabel>
            <Input id="general-studio-name" aria-invalid={!!errors.studioName} {...register('studioName')} />
            {errors.studioName ? <FieldError>{m.settings.general.errors.studioNameRequired}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="general-email">{m.settings.general.emailLabel}</FieldLabel>
            <Input id="general-email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email ? <FieldError>{m.settings.general.errors.emailInvalid}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="general-phone">{m.settings.general.phoneLabel}</FieldLabel>
            <Input id="general-phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
            {errors.phone ? <FieldError>{m.settings.general.errors.phoneRequired}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.timezone}>
            <FieldLabel htmlFor="general-timezone">{m.settings.general.timezoneLabel}</FieldLabel>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select name="timezone" value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="general-timezone" className="w-full">
                    <SelectValue placeholder={m.settings.general.timezonePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {m.settings.general.timezoneOptions[id] ?? id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.timezone ? <FieldError>{m.settings.general.errors.timezoneRequired}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.address} className="md:col-span-2">
            <FieldLabel htmlFor="general-address">{m.settings.general.addressLabel}</FieldLabel>
            <Input id="general-address" aria-invalid={!!errors.address} {...register('address')} />
            {errors.address ? <FieldError>{m.settings.general.errors.addressRequired}</FieldError> : null}
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {m.settings.general.saveButton}
          </Button>
        </div>
      </form>

      {/* Language control (CLAUDE.md, docs/13-DECISIONS.md): reads/writes useLocaleStore
          directly, never StudioSettings/the settings store above - the locale is a per-viewer
          UI preference, not demo data, so "Reset demo data" (ADR-022) must never throw the
          language back to Spanish mid-demo. Kept outside the react-hook-form above for the same
          reason: that form only ever submits StudioSettings['general']. */}
      <div className="mt-5 border-t border-border pt-5">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="general-language">{m.settings.languageLabel}</FieldLabel>
          <Select value={locale} onValueChange={(value) => setLocale(value as typeof locale)}>
            <SelectTrigger id="general-language" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((code) => (
                <SelectItem key={code} value={code}>
                  {LOCALE_LABELS[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </SectionCard>
  );
}
