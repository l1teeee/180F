'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/memberships/" Phase 7 + docs/03
// section 11.4-A "Form dialog" (md, 520px). The documented prop contract has no onSave callback:
// docs/06 section 3.11 says this dialog "writes through useCatalogStore.updatePlan()" itself,
// the same way the shared ConfirmDialog owns its own onConfirm call rather than delegating the
// write further up.
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { MembershipPlan } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';
import { useCatalogStore } from '@/stores/catalog.store';

export interface PlanEditDialogProps {
  plan: MembershipPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Every field stays a plain string at the form-values level (RHF/zodResolver's generic
// inference gets awkward when a coerced/transformed field makes the resolver's input type and
// output type diverge) - monthlyPrice and classLimit are parsed back to numbers in onSubmit,
// the same place classLimit's blank-means-unlimited conversion already has to happen.
// Built per-render (not a module-level const) so validation messages follow the active locale.
function buildPlanEditSchema(validation: Messages['memberships']['validation']) {
  return z.object({
    name: z.string().trim().min(1, validation.planNameRequired),
    monthlyPrice: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value), { message: validation.invalidPrice }),
    // '' means unlimited (MembershipPlan.classLimit === null); otherwise a whole number > 0.
    classLimit: z
      .string()
      .trim()
      .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) > 0), {
        message: validation.invalidClassLimit,
      }),
    benefits: z.string(),
  });
}

type PlanEditFormValues = z.infer<ReturnType<typeof buildPlanEditSchema>>;

// Seeds the textarea with each benefit's TRANSLATED label, never the raw stored string (which
// may be a stable key like 'guest_pass' - see src/data/memberships.ts). Editing and saving a
// plan then writes back whatever the user typed as literal text, which renders verbatim through
// membership-card.tsx's `?? benefit` fallback. Tradeoff, accepted deliberately: this converts a
// plan's seeded keys into literal text in the language it was edited in, so a plan edited in
// Spanish keeps showing Spanish after switching to English. Fine for a demo nobody edits
// mid-presentation; a key-picker UI here would be more machinery than this screen deserves.
function toFormValues(plan: MembershipPlan, benefitLabel: Messages['memberships']['benefitLabel']): PlanEditFormValues {
  return {
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    classLimit: plan.classLimit === null ? '' : String(plan.classLimit),
    benefits: plan.benefits
      .map((benefit) => benefitLabel[benefit as keyof typeof benefitLabel] ?? benefit)
      .join(', '),
  };
}

export function PlanEditDialog({ plan, open, onOpenChange }: PlanEditDialogProps) {
  const m = useMessages();
  const updatePlan = useCatalogStore((state) => state.updatePlan);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanEditFormValues>({
    resolver: zodResolver(buildPlanEditSchema(m.memberships.validation)),
    defaultValues: plan
      ? toFormValues(plan, m.memberships.benefitLabel)
      : { name: '', monthlyPrice: '', classLimit: '', benefits: '' },
  });

  // Re-seeds the form whenever a different plan is opened for editing (the dialog instance is
  // shared across all four cards, so it never remounts on its own).
  useEffect(() => {
    if (plan && open) reset(toFormValues(plan, m.memberships.benefitLabel));
  }, [plan, open, reset, m.memberships.benefitLabel]);

  if (!plan) return null;

  function onSubmit(values: PlanEditFormValues) {
    const benefits = values.benefits
      .split(',')
      .map((benefit) => benefit.trim())
      .filter(Boolean);

    updatePlan(plan!.id, {
      name: values.name.trim(),
      monthlyPrice: Number(values.monthlyPrice),
      classLimit: values.classLimit === '' ? null : Number(values.classLimit),
      benefits,
    });
    toast.success(m.memberships.dialog.toastPlanUpdated);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex-none">
          <DialogTitle>{m.memberships.dialog.title(plan.name)}</DialogTitle>
          <DialogDescription>{m.memberships.dialog.description}</DialogDescription>
        </DialogHeader>

        {/* docs/03-DESIGN-SYSTEM.md section 11.2/11.3: max-height 85vh, body scrolls, header and
            footer stay fixed - mirrors src/app/design-system/_components/overlays/booking-dialog.tsx's
            flex-1 overflow-y-auto body, the reference pattern A implementation names explicitly. */}
        <form id="plan-edit-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 overflow-y-auto">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="plan-name">{m.memberships.dialog.planNameLabel}</FieldLabel>
              <Input id="plan-name" autoComplete="off" aria-invalid={!!errors.name} {...register('name')} />
              {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.monthlyPrice}>
              <FieldLabel htmlFor="plan-price">{m.memberships.dialog.monthlyPriceLabel}</FieldLabel>
              <Input
                id="plan-price"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={!!errors.monthlyPrice}
                {...register('monthlyPrice')}
              />
              {errors.monthlyPrice ? <FieldError>{errors.monthlyPrice.message}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.classLimit}>
              <FieldLabel htmlFor="plan-class-limit">{m.memberships.dialog.classLimitLabel}</FieldLabel>
              <Input
                id="plan-class-limit"
                placeholder={m.memberships.dialog.classLimitPlaceholder}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={!!errors.classLimit}
                {...register('classLimit')}
              />
              {errors.classLimit ? <FieldError>{errors.classLimit.message}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.benefits}>
              <FieldLabel htmlFor="plan-benefits">{m.memberships.dialog.benefitsLabel}</FieldLabel>
              <Input
                id="plan-benefits"
                placeholder={m.memberships.dialog.benefitsPlaceholder}
                autoComplete="off"
                aria-invalid={!!errors.benefits}
                {...register('benefits')}
              />
              {errors.benefits ? <FieldError>{errors.benefits.message}</FieldError> : null}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter className="flex-none">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {m.memberships.dialog.cancel}
          </Button>
          <Button type="submit" form="plan-edit-form" variant="primary" disabled={isSubmitting}>
            {m.memberships.dialog.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
