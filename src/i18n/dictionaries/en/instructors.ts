// Owned by: instructors screens (src/components/instructors/**, src/app/(admin)/instructors/**).
// English's shape is checked against Spanish (the source of truth, es/instructors.ts) with
// `satisfies Messages` in en/index.ts.
export const instructors = {
  pageTitle: 'Instructors',
  pageSubtitle: 'Studio team, specialties and schedules.',
  backToInstructors: 'Instructors',

  sessionsPerWeekUnit: (n: number): string => (n === 1 ? 'session / week' : 'sessions / week'),

  statusLabel: {
    available: 'Available',
    in_class: 'In class',
    off_today: 'Off today',
  },

  sections: {
    weeklySchedule: 'Weekly schedule',
    recentClasses: 'Recent classes',
    schedulePreview: 'Schedule preview',
  },

  emptyStates: {
    noUpcomingSessions: 'No upcoming sessions this week.',
    noClassesTaught: 'No classes taught yet.',
    noClassesToday: 'No classes',
  },

  stats: {
    classesThisMonth: 'Classes this month',
    reservations: 'Reservations',
    occupancy: 'Occupancy',
    rating: 'Rating',
    ratingUnit: '/ 5',
  },

  overbooked: 'Overbooked',
  spotsLabel: (booked: number, capacity: number): string => `${booked}/${capacity} spots`,

  errorTitle: 'Something went wrong',
};
