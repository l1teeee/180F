// Owned by: classes screens (src/components/classes/**, src/app/(admin)/classes/**).
// Spanish is the shape's source of truth - en/classes.ts is checked against this file's key
// set with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
export const classes = {
  pageTitle: 'Clases',
  pageSubtitle: 'El catálogo completo de clases y la demanda semanal.',
  backToClasses: 'Clases',

  // Keyed by the domain id, never a second category->texto map (CLAUDE.md rule 6):
  // src/domain/constants/class-accent.ts still owns the accent, this only owns the copy.
  categoryLabel: {
    strength: 'Fuerza',
    cardio: 'Cardio',
    mind_body: 'Mente y cuerpo',
    combat: 'Combate',
  },

  // Traduce el código de día fijo que emite selectClassWeekdayBookings (ver en/classes.ts).
  weekdayShort: {
    Mon: 'lun',
    Tue: 'mar',
    Wed: 'mié',
    Thu: 'jue',
    Fri: 'vie',
    Sat: 'sáb',
    Sun: 'dom',
  },

  card: {
    avgOccupancy: 'Ocupación media',
    instructorsLabel: 'Instructores',
    unassigned: 'Sin asignar',
  },
  // Plurals/interpolation are plain functions kept in this file, never a template
  // mini-language (CLAUDE.md rule 3) - each language owns its own plural rules. The count
  // itself is rendered separately (a bold span) by the caller, so this returns only the unit
  // words that agree with it in number.
  sessionsPerWeekUnit: (n: number): string => (n === 1 ? 'sesión / semana' : 'sesiones / semana'),

  detail: {
    durationUnit: 'min',
    capacityUnit: 'plazas / sesión',
    instructorsLabel: 'Instructores',
    unassigned: 'Sin asignar',
  },

  stats: {
    averageOccupancy: 'Ocupación media',
    bookingsThisMonth: 'Reservas este mes',
    cancellationRate: 'Tasa de cancelación',
  },

  sections: {
    bookingsByWeekday: 'Reservas por día de la semana',
    weeklySchedule: 'Horario semanal',
  },

  emptyStates: {
    noSessionsScheduled: 'No hay sesiones programadas.',
  },

  overbooked: 'Sobrerreservado',
  spotsLabel: (booked: number, capacity: number): string => `${booked}/${capacity} plazas`,

  chartTodayLabel: (n: number): string => `Hoy · ${n}`,
  bookingsCount: (n: number): string => (n === 1 ? '1 reserva' : `${n} reservas`),
  weekdayBookingsSummary: (min: number, max: number, highlightDay: string, entries: string): string =>
    `Reservas por día de la semana, entre ${min} y ${max}. Hoy es ${highlightDay}. ${entries}.`,
  weekdayEntry: (day: string, bookings: number): string => `${day}: ${bookings}`,

  errorTitle: 'Algo salió mal',
};
