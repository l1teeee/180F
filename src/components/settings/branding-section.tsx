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

type BrandingValues = StudioSettings['branding'];

interface BrandingSectionProps {
  branding: BrandingValues;
  onSave: (changes: BrandingValues) => void;
}

export function BrandingSection({ branding, onSave }: BrandingSectionProps) {
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
    toast.success('Branding settings saved.');
  }

  // useWatch (not useForm's own watch()) so React Compiler can memoise this component - watch()
  // is a plain subscription callback the compiler cannot see into (react-hooks/incompatible-
  // library), while useWatch is a proper hook it can analyse.
  const primaryColor = useWatch({ control, name: 'primaryColor' });
  const accentColor = useWatch({ control, name: 'accentColor' });

  return (
    <SectionCard title="Branding">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="branding-logo">Logo URL</FieldLabel>
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <Input
                  id="branding-logo"
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value === '' ? null : event.target.value)}
                />
              )}
            />
            <p className="text-sm text-text-secondary">Leave blank to use the default studio initial.</p>
          </Field>

          <Field data-invalid={!!errors.primaryColor}>
            <FieldLabel htmlFor="branding-primary-color">Primary color</FieldLabel>
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
            {errors.primaryColor ? <FieldError>{errors.primaryColor.message}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.accentColor}>
            <FieldLabel htmlFor="branding-accent-color">Accent color</FieldLabel>
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
            {errors.accentColor ? <FieldError>{errors.accentColor.message}</FieldError> : null}
          </Field>
        </div>

        <div
          className="flex flex-wrap items-center gap-3 rounded-field border border-border p-3"
          style={{ backgroundImage: `linear-gradient(150deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
        >
          <span className="rounded-pill bg-white/90 px-3 py-1 text-xs font-semibold text-ink">Live preview</span>
          <span className="text-sm font-medium text-white">This is how your brand colors pair together.</span>
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
