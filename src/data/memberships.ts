// Hand-authored - docs/05-MOCK-DATA-STRATEGY.md section 3.4.
//
// `benefits` holds stable KEYS (see BenefitKey below), not sentences: MembershipPlan.benefits is
// typed string[] in src/domain/types/entities.ts (not owned by this namespace), but seeding a
// fixed English sentence here would keep it English in both languages forever - the seed layer
// may not pick a locale (docs/02-ARCHITECTURE.md section 1). Render sites translate each key
// through the `memberships` namespace's `benefitLabel` map. Plan NAMES ("Basic", "Unlimited", ...)
// and prices are catalogue data, not sentences, and stay untranslated.
import type { MembershipPlan } from '@/domain/types';

export type BenefitKey =
  | 'basic_monthly_classes'
  | 'every_class_type'
  | 'priority_booking'
  | 'guest_pass'
  | 'single_class';

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    monthlyPrice: 29,
    billingPeriod: 'monthly',
    classLimit: 8,
    benefits: ['basic_monthly_classes' satisfies BenefitKey],
    accent: 'blue',
  },
  {
    id: 'plan-unlimited',
    name: 'Unlimited',
    monthlyPrice: 49,
    billingPeriod: 'monthly',
    classLimit: null,
    benefits: ['every_class_type' satisfies BenefitKey],
    accent: 'purple',
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    monthlyPrice: 69,
    billingPeriod: 'monthly',
    classLimit: null,
    benefits: [
      'every_class_type' satisfies BenefitKey,
      'priority_booking' satisfies BenefitKey,
      'guest_pass' satisfies BenefitKey,
    ],
    accent: 'yellow',
  },
  {
    id: 'plan-day-pass',
    name: 'Day Pass',
    monthlyPrice: 8,
    billingPeriod: 'one_time',
    classLimit: 1,
    benefits: ['single_class' satisfies BenefitKey],
    accent: 'green',
  },
];
