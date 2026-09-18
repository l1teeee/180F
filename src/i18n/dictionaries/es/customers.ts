// Owned by: customers screens (/customers, /customers/[id]). Spanish is the shape's source of
// truth (CLAUDE.md) - en/customers.ts is checked against this object's keys with `satisfies
// Messages`. Domain status ids (CustomerStatus) are looked up by key in `status` rather than
// translating CUSTOMER_STATUS_STYLE's own English label, per docs/07 section 7: the accent/colour
// map stays the single source of truth for accent, this namespace is the single source of truth
// for the customers screens' status text.
export const customers = {
  page: {
    title: 'Clientes',
    subtitle: 'Listado de socios, actividad y estado.',
  },
  kpis: {
    totalCustomers: 'Total de clientes',
    activeMemberships: 'Membresías activas',
    newThisMonth: 'Nuevos este mes',
    inactive: 'Inactivos',
  },
  filters: {
    searchPlaceholder: 'Buscar clientes...',
    statusAriaLabel: 'Filtrar por estado',
    statusPlaceholder: 'Estado',
    allStatuses: 'Todos los estados',
    membershipAriaLabel: 'Filtrar por membresía',
    membershipPlaceholder: 'Membresía',
    allMemberships: 'Todas las membresías',
  },
  status: {
    active: 'Activo',
    paused: 'Pausado',
    inactive: 'Inactivo',
  },
  table: {
    sectionTitle: 'Todos los clientes',
    customer: 'Cliente',
    membership: 'Membresía',
    lastVisit: 'Última visita',
    classesThisMonth: 'Clases este mes',
    status: 'Estado',
    never: 'Nunca',
    showDetails: 'Mostrar detalles',
    hideDetails: 'Ocultar detalles',
    emptyTitle: 'No se encontraron clientes',
    emptyDescription: 'Intenta cambiar tus filtros.',
  },
  detail: {
    backToCustomers: 'Volver a clientes',
    recentActivity: 'Actividad reciente',
    profile: {
      email: 'Correo electrónico',
      phone: 'Teléfono',
      memberSince: 'Miembro desde',
      membership: 'Membresía',
      remainingCredits: 'Créditos restantes',
      unlimited: 'Ilimitado',
      perMonthUnit: '/mes',
      unlimitedClasses: 'Clases ilimitadas',
      classesPerMonth: (n: number) => (n === 1 ? '1 clase / mes' : `${n} clases / mes`),
      unlimitedCreditsRemaining: 'Créditos ilimitados restantes',
      creditsRemainingThisMonth: (n: number) =>
        n === 1 ? '1 crédito restante este mes' : `${n} créditos restantes este mes`,
    },
    stats: {
      classesThisMonth: 'Clases este mes',
      attendanceRate: 'Tasa de asistencia',
      noShows: 'Inasistencias',
      favoriteClass: 'Clase favorita',
      noneYet: 'Ninguna aún',
    },
  },
  activity: {
    emptyTitle: 'Aún no hay actividad',
    joined: 'Se unió a 180 Fitness Studio',
    unknownClass: 'una clase',
    cancelled: (className: string) => `Canceló ${className}`,
    attended: (className: string) => `Asistió a ${className}`,
    missed: (className: string) => `Faltó a ${className}`,
    reserved: (className: string) => `Reservó ${className}`,
    justNow: 'Justo ahora',
    minutesAgo: (n: number) => (n === 1 ? 'Hace 1 minuto' : `Hace ${n} minutos`),
    hoursAgo: (n: number) => (n === 1 ? 'Hace 1 hora' : `Hace ${n} horas`),
    daysAgo: (n: number) => (n === 1 ? 'Hace 1 día' : `Hace ${n} días`),
  },
};
