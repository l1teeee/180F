// Owned by: memberships screen (src/components/memberships/**, src/app/(admin)/memberships/page.tsx).
// English's shape is checked against Spanish (the source of truth, es/memberships.ts) with
// `satisfies Messages` in en/index.ts.
export const memberships = {
  pageTitle: 'Memberships',
  pageSubtitle: 'Plans, pricing and member counts.',
  errorDescription: "We couldn't load your membership plans.",

  pricePerMonthSuffix: '/month',
  memberCount: (n: number): string => (n === 1 ? '1 member' : `${n} members`),

  // Keyed by src/data/memberships.ts's BenefitKey (a seeded catalog key, not a sentence - the
  // seed layer may not pick a locale, docs/02-ARCHITECTURE.md section 1). Render sites outside
  // this namespace's write set (components/memberships/**) still read `benefits` as raw strings
  // and must migrate to this map before they can drop the fallback of showing the key itself.
  benefitLabel: {
    basic_monthly_classes: '8 classes per month',
    every_class_type: 'Access to every class type',
    priority_booking: 'Priority booking',
    guest_pass: '1 guest pass',
    single_class: 'Single class',
  },

  card: {
    editPlan: 'Edit plan',
    viewMembers: 'View members',
    editPlanAria: (planName: string): string => `Edit ${planName} plan`,
    viewMembersAria: (planName: string): string => `View ${planName} members`,
  },

  dialog: {
    title: (planName: string): string => `Edit ${planName}`,
    description: 'Changes apply immediately across the demo. No payment or billing is processed.',
    planNameLabel: 'Plan name',
    monthlyPriceLabel: 'Monthly price (USD)',
    classLimitLabel: 'Classes per month',
    classLimitPlaceholder: 'Leave blank for unlimited',
    benefitsLabel: 'Benefits',
    benefitsPlaceholder: 'Comma-separated',
    cancel: 'Cancel',
    saveChanges: 'Save changes',
    toastPlanUpdated: 'Plan updated',
  },

  validation: {
    planNameRequired: 'Enter a plan name',
    invalidPrice: 'Enter a valid price',
    invalidClassLimit: 'Enter a whole number, or leave blank for unlimited',
  },
};
