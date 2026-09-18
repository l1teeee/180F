// Hand-authored - docs/05-MOCK-DATA-STRATEGY.md section 3.4.
import type { MembershipPlan } from '@/domain/types';

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    monthlyPrice: 29,
    billingPeriod: 'monthly',
    classLimit: 8,
    benefits: ['8 classes per month'],
    accent: 'blue',
  },
  {
    id: 'plan-unlimited',
    name: 'Unlimited',
    monthlyPrice: 49,
    billingPeriod: 'monthly',
    classLimit: null,
    benefits: ['Unlimited classes'],
    accent: 'purple',
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    monthlyPrice: 69,
    billingPeriod: 'monthly',
    classLimit: null,
    benefits: ['Unlimited classes', 'Priority booking', '1 guest pass'],
    accent: 'yellow',
  },
  {
    id: 'plan-day-pass',
    name: 'Day Pass',
    monthlyPrice: 8,
    billingPeriod: 'one_time',
    classLimit: 1,
    benefits: ['Single class'],
    accent: 'green',
  },
];
