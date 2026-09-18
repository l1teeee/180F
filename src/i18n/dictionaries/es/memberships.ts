// Owned by: memberships screen (src/components/memberships/**, src/app/(admin)/memberships/page.tsx).
// Spanish is the shape's source of truth - en/memberships.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
export const memberships = {
  pageTitle: 'Membresías',
  pageSubtitle: 'Planes, precios y número de miembros.',
  errorDescription: 'No se pudieron cargar los planes de membresía.',

  pricePerMonthSuffix: '/mes',
  // Plurals/interpolation are plain functions kept in this file, never a template
  // mini-language (CLAUDE.md rule 3) - each language owns its own plural rules.
  memberCount: (n: number): string => (n === 1 ? '1 miembro' : `${n} miembros`),

  // Keyed por BenefitKey (src/data/memberships.ts). Fuente de la forma para en/memberships.ts.
  benefitLabel: {
    basic_monthly_classes: '8 clases al mes',
    every_class_type: 'Acceso a todo tipo de clases',
    priority_booking: 'Reserva prioritaria',
    guest_pass: '1 pase de invitado',
    single_class: 'Una sola clase',
  },

  card: {
    editPlan: 'Editar plan',
    viewMembers: 'Ver miembros',
    editPlanAria: (planName: string): string => `Editar plan ${planName}`,
    viewMembersAria: (planName: string): string => `Ver miembros de ${planName}`,
  },

  dialog: {
    title: (planName: string): string => `Editar ${planName}`,
    description: 'Los cambios se aplican de inmediato en la demo. No se procesa ningún pago ni facturación.',
    planNameLabel: 'Nombre del plan',
    monthlyPriceLabel: 'Precio mensual (USD)',
    classLimitLabel: 'Clases por mes',
    classLimitPlaceholder: 'Deja en blanco para ilimitado',
    benefitsLabel: 'Beneficios',
    benefitsPlaceholder: 'Separados por comas',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    toastPlanUpdated: 'Plan actualizado',
  },

  validation: {
    planNameRequired: 'Introduce un nombre de plan',
    invalidPrice: 'Introduce un precio válido',
    invalidClassLimit: 'Introduce un número entero, o déjalo en blanco para ilimitado',
  },
};
