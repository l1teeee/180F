// Owned by: dashboard screens (src/components/dashboard/**, src/app/(admin)/dashboard/page.tsx).
// Spanish is the shape's source of truth - en/dashboard.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
export const dashboard = {
  greeting: 'Buenos días',
  subtitle: 'Esto es lo que pasa hoy en tu estudio.',

  kpis: {
    activeMembers: 'Miembros activos',
    todayBookings: 'Reservas de hoy',
    occupancy: 'Ocupación',
    todayClasses: 'Clases de hoy',
  },
  // Plurals/interpolation are plain functions kept in this file, never a template
  // mini-language (CLAUDE.md mock-data/i18n rules) - each language owns its own plural rules.
  activeMembersDelta: (n: number): string => `+${n} este mes`,
  bookingsDeltaVsYesterday: (signedPct: string): string => `${signedPct}% frente a ayer`,
  almostFullCount: (n: number): string => (n === 1 ? '1 casi lleno' : `${n} casi llenos`),

  sections: {
    weeklyBookings: 'Reservas semanales',
    classOccupancy: 'Ocupación de clases',
    upcomingClasses: 'Próximas clases',
    recentBookings: 'Reservas recientes',
  },

  table: {
    customer: 'Cliente',
    class: 'Clase',
    date: 'Fecha',
    time: 'Hora',
    source: 'Origen',
    status: 'Estado',
  },

  emptyStates: {
    noClassesScheduled: {
      title: 'No hay clases programadas',
      description: 'La ocupación de clases aparecerá cuando se den clases.',
    },
    noUpcomingClasses: {
      title: 'No hay próximas clases',
      description: 'Las clases programadas aparecerán aquí.',
    },
    noBookingsYet: {
      title: 'Todavía no hay reservas',
      description: 'Las reservas de hoy aparecerán aquí.',
    },
  },

  // Keyed by the domain id, never a second status->colour map (CLAUDE.md rule 6 / docs/07
  // section 7 anti-patterns): status-styles.ts still owns the accent, this only owns the copy.
  occupancyStateLabel: {
    available: 'Disponible',
    almost_full: 'Casi lleno',
    full: 'Lleno',
  },
  bookingStatusLabel: {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    waitlist: 'Lista de espera',
  },
  overbooked: 'Sobrerreservado',
  bookedLabel: 'reservados',

  chartTodayLabel: (n: number): string => `Hoy · ${n}`,
  bookingsCount: (n: number): string => (n === 1 ? '1 reserva' : `${n} reservas`),
  weeklyBookingsSummary: (startLabel: string, endLabel: string, min: number, max: number): string =>
    `Reservas semanales de ${startLabel} a ${endLabel}, entre ${min} y ${max} reservas.`,
  weeklyBookingsHighlight: (label: string, bookings: number): string =>
    `${label} está destacado con ${bookings} reservas.`,
  noWeeklyBookingData: 'No hay datos de reservas semanales disponibles.',

  loadingDashboard: 'Cargando panel…',
};
