// Owned by: calendar screens (src/app/(admin)/calendar/page.tsx, src/components/calendar/**).
export const calendar = {
  pageTitle: 'Calendar',
  pageSubtitle: 'Weekly, monthly and daily view of every scheduled class.',
  sectionTitle: 'Schedule',

  toolbar: {
    previousPeriod: 'Previous period',
    nextPeriod: 'Next period',
    today: 'Today',
    viewGroupLabel: 'Calendar view',
    week: 'Week',
    month: 'Month',
    day: 'Day',
  },

  event: {
    overbooked: 'Overbooked',
    full: 'FULL',
  },

  sheet: {
    title: 'Session details',
    dateLabel: 'Date',
    timeLabel: 'Time',
    instructorLabel: 'Instructor',
    roomLabel: 'Room',
    spotsReserved: (booked: number, capacity: number): string => `${booked} / ${capacity} spots reserved`,
    overbookedBy: (n: number): string =>
      `Overbooked by ${n}: capacity was reduced below the current booking count.`,
    onWaitlist: 'On waitlist',
    viewBookings: 'View bookings',
    editClass: 'Edit class',
    editClassUnavailable: "Editing a class isn't available in this demo.",
  },

  occupancyStateLabel: {
    available: 'Available',
    almost_full: 'Almost full',
    full: 'Full',
  },
};
