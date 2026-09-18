'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "Branding": logo, primary color, accent color.
// Validated by the one schema the domain layer publishes for this screen
// (domain/schemas/studio-settings.ts). Per that section's data note, branding restyles CSS
// custom properties rather than the fixed, contrast-checked token palette (ADR-020,
// globals.css) - so the live effect lives in this section's own preview swatch, not the app
// chrome, and no hex literal here ever reaches a shared file.
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { brandingSettingsSchema } from '@/domain/schemas';
import type { StudioSettings } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/shared/section-card';
import { useMessages } from '@/hooks/use-messages';
import { ResetDemoSection } from './reset-demo-section';

type BrandingValues = StudioSettings['branding'];

interface BrandingSectionProps {
  branding: BrandingValues;
  onSave: (changes: BrandingValues) => void;
}

export function BrandingSection({ branding, onSave }: BrandingSectionProps) {
  const m = useMessages();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandingValues>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: branding,
  });

  useEffect(() => {
    reset(branding);
  }, [branding, reset]);

  function onSubmit(values: BrandingValues) {
    onSave(values);
    toast.success(m.settings.branding.savedToast);
  }

  // useWatch (not useForm's own watch()) so React Compiler can memoise this component - watch()
  // is a plain subscription callback the compiler cannot see into (react-hooks/incompatible-
  // library), while useWatch is a proper hook it can analyse.
  const primaryColor = useWatch({ control, name: 'primaryColor' });
  const accentColor = useWatch({ control, name: 'accentColor' });

  return (
    // A second, unrelated card (ResetDemoSection) renders alongside this one - see that
    // component's own top comment for why it is mounted here instead of in page.tsx.
    <>
      <SectionCard title={m.settings.branding.title}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="branding-logo">{m.settings.branding.logoLabel}</FieldLabel>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <Input
                    id="branding-logo"
                    placeholder={m.settings.branding.logoPlaceholder}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value === '' ? null : event.target.value)}
                  />
                )}
              />
              <p className="text-sm text-text-secondary">{m.settings.branding.logoHelperText}</p>
            </Field>

            <Field data-invalid={!!errors.primaryColor}>
              <FieldLabel htmlFor="branding-primary-color">{m.settings.branding.primaryColorLabel}</FieldLabel>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-field border border-border"
                  style={{ backgroundColor: primaryColor }}
                />
                <Input
                  id="branding-primary-color"
                  placeholder="#7869D4"
                  aria-invalid={!!errors.primaryColor}
                  {...register('primaryColor')}
                />
              </div>
              {errors.primaryColor ? <FieldError>{m.settings.branding.errors.primaryColorInvalid}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.accentColor}>
              <FieldLabel htmlFor="branding-accent-color">{m.settings.branding.accentColorLabel}</FieldLabel>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-field border border-border"
                  style={{ backgroundColor: accentColor }}
                />
                <Input
                  id="branding-accent-color"
                  placeholder="#F5D889"
                  aria-invalid={!!errors.accentColor}
                  {...register('accentColor')}
                />
              </div>
              {errors.accentColor ? <FieldError>{m.settings.branding.errors.accentColorInvalid}</FieldError> : null}
            </Field>
          </div>

          <div
            className="flex flex-wrap items-center gap-3 rounded-field border border-border p-3"
            style={{ backgroundImage: `linear-gradient(150deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
          >
            <span className="rounded-pill bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
              {m.settings.branding.livePreviewBadge}
            </span>
            <span className="text-sm font-medium text-white">{m.settings.branding.livePreviewDescription}</span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {m.settings.branding.saveButton}
            </Button>
          </div>
        </form>
      </SectionCard>
      <ResetDemoSection />
    </>
  );
}
