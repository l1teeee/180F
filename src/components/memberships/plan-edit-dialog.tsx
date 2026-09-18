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
const planEditSchema = z.object({
  name: z.string().trim().min(1, 'Enter a plan name'),
  monthlyPrice: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), { message: 'Enter a valid price' }),
  // '' means unlimited (MembershipPlan.classLimit === null); otherwise a whole number > 0.
  classLimit: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) > 0), {
      message: 'Enter a whole number, or leave blank for unlimited',
    }),
  benefits: z.string(),
});

type PlanEditFormValues = z.infer<typeof planEditSchema>;

function toFormValues(plan: MembershipPlan): PlanEditFormValues {
  return {
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    classLimit: plan.classLimit === null ? '' : String(plan.classLimit),
    benefits: plan.benefits.join(', '),
  };
}

export function PlanEditDialog({ plan, open, onOpenChange }: PlanEditDialogProps) {
  const updatePlan = useCatalogStore((state) => state.updatePlan);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanEditFormValues>({
    resolver: zodResolver(planEditSchema),
    defaultValues: plan ? toFormValues(plan) : { name: '', monthlyPrice: '', classLimit: '', benefits: '' },
  });

  // Re-seeds the form whenever a different plan is opened for editing (the dialog instance is
  // shared across all four cards, so it never remounts on its own).
  useEffect(() => {
    if (plan && open) reset(toFormValues(plan));
  }, [plan, open, reset]);

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
    toast.success('Plan updated');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* position="top" is a deliberate workaround, not the pattern-A default: src/components/
          ui/dialog.tsx's position="center" combines "-translate-y-1/2" (centering) with
          "data-[state=open]:translate-y-0" (entrance settle) on the same --tw-translate-y
          property, so the open state's translate-y-0 silently zeroes the centering offset -
          confirmed via computed style (transform: none, --tw-translate-y: 0px instead of -50%).
          That traps this dialog's footer off-screen on any viewport shorter than roughly twice
          its content height, with no page scroll available to reach it (background scroll is
          locked while a dialog is open, docs/03 section 11.6). ui/dialog.tsx is outside this
          task's write set, so this is reported for a central fix rather than edited here;
          position="top" (already a supported value on the same primitive) sidesteps the
          conflict entirely, since its own translate-y-0 has no competing offset to cancel. */}
      <DialogContent size="md" position="top">
        <DialogHeader className="flex-none">
          <DialogTitle>Edit {plan.name}</DialogTitle>
          <DialogDescription>Changes apply immediately across the demo. No payment or billing is processed.</DialogDescription>
        </DialogHeader>

        {/* docs/03-DESIGN-SYSTEM.md section 11.2/11.3: max-height 85vh, body scrolls, header and
            footer stay fixed - mirrors src/app/design-system/_components/overlays/booking-dialog.tsx's
            flex-1 overflow-y-auto body, the reference pattern A implementation names explicitly. */}
        <form id="plan-edit-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 overflow-y-auto">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="plan-name">Plan name</FieldLabel>
              <Input id="plan-name" autoComplete="off" aria-invalid={!!errors.name} {...register('name')} />
              {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.monthlyPrice}>
              <FieldLabel htmlFor="plan-price">Monthly price (USD)</FieldLabel>
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
              <FieldLabel htmlFor="plan-class-limit">Classes per month</FieldLabel>
              <Input
                id="plan-class-limit"
                placeholder="Leave blank for unlimited"
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={!!errors.classLimit}
                {...register('classLimit')}
              />
              {errors.classLimit ? <FieldError>{errors.classLimit.message}</FieldError> : null}
            </Field>

            <Field data-invalid={!!errors.benefits}>
              <FieldLabel htmlFor="plan-benefits">Benefits</FieldLabel>
              <Input
                id="plan-benefits"
                placeholder="Comma-separated"
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
            Cancel
          </Button>
          <Button type="submit" form="plan-edit-form" variant="primary" disabled={isSubmitting}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
