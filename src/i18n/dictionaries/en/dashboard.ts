// Owned by: dashboard screens (src/components/dashboard/**, src/app/(admin)/dashboard/page.tsx).
// Checked against es/dashboard.ts (the shape's source of truth) with `satisfies Messages`
// in index.ts - a missing, extra or misspelled key here is a compile error.
export const dashboard = {
  greeting: 'Good morning',
  subtitle: "Here's what's happening at your studio today.",

  kpis: {
    activeMembers: 'Active members',
    todayBookings: "Today's bookings",
    occupancy: 'Occupancy',
    todayClasses: "Today's classes",
  },
  activeMembersDelta: (n: number): string => `+${n} this month`,
  bookingsDeltaVsYesterday: (signedPct: string): string => `${signedPct}% vs yesterday`,
  almostFullCount: (n: number): string => (n === 1 ? '1 nearly full' : `${n} nearly full`),

  sections: {
    weeklyBookings: 'Weekly bookings',
    classOccupancy: 'Class occupancy',
    upcomingClasses: 'Upcoming classes',
    recentBookings: 'Recent bookings',
  },

  table: {
    customer: 'Customer',
    class: 'Class',
    date: 'Date',
    time: 'Time',
    source: 'Source',
    status: 'Status',
  },

  emptyStates: {
    noClassesScheduled: {
      title: 'No classes scheduled',
      description: 'Class occupancy will appear once classes run.',
    },
    noUpcomingClasses: {
      title: 'No upcoming classes',
      description: 'Scheduled classes will show up here.',
    },
    noBookingsYet: {
      title: 'No bookings yet',
      description: 'Bookings made today will show up here.',
    },
  },

  occupancyStateLabel: {
    available: 'Available',
    almost_full: 'Almost full',
    full: 'Full',
  },
  bookingStatusLabel: {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    waitlist: 'Waitlist',
  },
  overbooked: 'Overbooked',
  bookedLabel: 'booked',

  chartTodayLabel: (n: number): string => `Today · ${n}`,
  bookingsCount: (n: number): string => (n === 1 ? '1 booking' : `${n} bookings`),
  weeklyBookingsSummary: (startLabel: string, endLabel: string, min: number, max: number): string =>
    `Weekly bookings from ${startLabel} to ${endLabel}, ranging from ${min} to ${max} bookings.`,
  weeklyBookingsHighlight: (label: string, bookings: number): string =>
    `${label} is highlighted at ${bookings} bookings.`,
  noWeeklyBookingData: 'No weekly booking data available.',

  loadingDashboard: 'Loading dashboard…',
};
