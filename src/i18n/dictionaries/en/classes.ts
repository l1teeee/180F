// Owned by: classes screens (src/components/classes/**, src/app/(admin)/classes/**).
// English's shape is checked against Spanish (the source of truth, es/classes.ts) with
// `satisfies Messages` in en/index.ts.
export const classes = {
  pageTitle: 'Classes',
  pageSubtitle: 'The full class catalog and weekly demand.',
  backToClasses: 'Classes',

  categoryLabel: {
    strength: 'Strength',
    cardio: 'Cardio',
    mind_body: 'Mind & Body',
    combat: 'Combat',
  },

  // Keyed by src/domain/selectors/classes.ts's ClassWeekdayBookingPoint.day - a fixed English
  // weekday code the selector emits and the chart also uses to match the highlighted bar
  // (domain/selectors/** may not pick a locale, docs/02-ARCHITECTURE.md section 1), never
  // displayed verbatim - class-weekday-chart.tsx translates each one through this map.
  weekdayShort: {
    Mon: 'Mon',
    Tue: 'Tue',
    Wed: 'Wed',
    Thu: 'Thu',
    Fri: 'Fri',
    Sat: 'Sat',
    Sun: 'Sun',
  },

  card: {
    avgOccupancy: 'Avg. occupancy',
    instructorsLabel: 'Instructors',
    unassigned: 'Unassigned',
  },
  sessionsPerWeekUnit: (n: number): string => (n === 1 ? 'session / week' : 'sessions / week'),

  detail: {
    durationUnit: 'min',
    capacityUnit: 'spots / session',
    instructorsLabel: 'Instructors',
    unassigned: 'Unassigned',
  },

  stats: {
    averageOccupancy: 'Average occupancy',
    bookingsThisMonth: 'Bookings this month',
    cancellationRate: 'Cancellation rate',
  },

  sections: {
    bookingsByWeekday: 'Bookings by weekday',
    weeklySchedule: 'Weekly schedule',
  },

  emptyStates: {
    noSessionsScheduled: 'No sessions scheduled.',
  },

  overbooked: 'Overbooked',
  spotsLabel: (booked: number, capacity: number): string => `${booked}/${capacity} spots`,

  chartTodayLabel: (n: number): string => `Today · ${n}`,
  bookingsCount: (n: number): string => (n === 1 ? '1 booking' : `${n} bookings`),
  weekdayBookingsSummary: (min: number, max: number, highlightDay: string, entries: string): string =>
    `Bookings by weekday, ranging from ${min} to ${max}. ${highlightDay} is today. ${entries}.`,
  weekdayEntry: (day: string, bookings: number): string => `${day}: ${bookings}`,

  errorTitle: 'Something went wrong',
};
