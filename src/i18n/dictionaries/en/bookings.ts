// Owned by: bookings screens (src/components/bookings/**, src/app/(admin)/bookings/page.tsx).
// Checked against src/i18n/dictionaries/es/bookings.ts (the shape's source of truth) with
// `satisfies Messages` below.
import type { CancellationRejectionReason, PromotionRejectionReason } from '@/domain/selectors';

// selectPromotionEligibility and selectCancellationEligibility (src/domain/selectors/bookings.ts)
// each return a locale-free `reason` code (+ `limit` when the reason needs a number to
// interpolate, promotion/creation only) instead of a sentence - this is where that reason
// becomes English copy. One function covers both reason unions since they never overlap and
// both describe why a booking action was rejected.
function promotionRejectionReason(reason: PromotionRejectionReason | CancellationRejectionReason, limit?: number): string {
  switch (reason) {
    case 'already_cancelled':
      return 'This booking was already cancelled.';
    case 'outside_cancellation_window':
      return 'This cancellation is outside the allowed window.';
    case 'not_waitlisted':
      return 'This booking is not on the waitlist.';
    case 'session_not_found':
      return 'This session could not be found.';
    case 'session_cancelled':
      return 'This session has been cancelled.';
    case 'session_started':
      return 'This session has already started.';
    case 'session_full':
      return 'This session is full.';
    case 'already_booked':
      return 'This customer already has a booking for this session.';
    case 'daily_limit_reached':
      return `This customer already has ${limit ?? 0} booking(s) on this day.`;
    case 'outside_booking_window':
      return 'This booking is outside the advance-booking window.';
    case 'waitlist_disabled':
      return 'Waitlist is turned off for this studio.';
    case 'waitlist_not_available':
      return 'This session still has open spots.';
    default:
      return 'This booking cannot be promoted.';
  }
}

export const bookings = {
  promotionRejectionReason,
  title: 'Bookings',
  subtitle: 'Manage all class reservations.',
  newBooking: 'New booking',
  allBookings: 'All bookings',

  tabs: {
    all: 'All',
  },

  bookingStatusLabel: {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    waitlist: 'Waitlist',
  },
  bookingSourceLabel: {
    website: 'Website',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    reception: 'Reception',
  },

  filters: {
    searchPlaceholder: 'Search by customer...',
    filterByStatus: 'Filter by status',
    filterBySource: 'Filter by source',
    filterByDate: 'Filter by date',
    allStatuses: 'All statuses',
    allSources: 'All sources',
  },

  table: {
    customer: 'Customer',
    class: 'Class',
    instructor: 'Instructor',
    date: 'Date',
    time: 'Time',
    source: 'Source',
    status: 'Status',
  },

  promoteCannotYet: 'This booking cannot be promoted yet.',
  promote: 'Promote',
  promoteToConfirmed: 'Promote to confirmed',
  seatOpen: 'Seat open',
  cancelBookingFor: (customerName: string): string => `Cancel booking for ${customerName}`,

  emptyState: {
    title: 'No bookings found',
    description: 'Try changing your filters or create a new booking.',
    action: 'Create booking',
  },

  filteredToSession: (sessionLabel: string): string => `Filtered to session: ${sessionLabel}`,
  clear: 'Clear',

  cancelDialog: {
    title: 'Cancel this booking?',
    description: (customerName: string, className: string, dateLabel: string): string =>
      `This cancels ${customerName}'s booking for ${className} on ${dateLabel} and cannot be undone.`,
    confirmLabel: 'Cancel booking',
  },

  toastCancelled: 'Booking cancelled',
  toastPromoted: (customerName: string): string => `${customerName} promoted to confirmed.`,
  toastCreated: 'Booking created successfully',

  dialog: {
    title: 'New booking',
    description: 'Reserve a spot for a customer in an upcoming class.',
    customerLabel: 'Customer',
    selectCustomer: 'Select a customer',
    classLabel: 'Class',
    selectClass: 'Select a class',
    dateLabel: 'Date',
    selectDate: 'Select a date',
    selectClassFirst: 'Select a class first',
    timeLabel: 'Time',
    selectTime: 'Select a time',
    selectDateFirst: 'Select a date first',
    instructorLabel: 'Instructor',
    derivedFromClass: 'Derived from class',
    sessionOptionFull: 'FULL',
    sessionOptionSpots: (booked: number, capacity: number): string => `${booked}/${capacity} spots`,
    spotsReserved: (booked: number, capacity: number): string => `${booked} / ${capacity} spots reserved`,
    fullClassNotice: 'This class is full. Join the waitlist and we will reach out the moment a spot opens.',
    joinWaitlist: 'Join waitlist',
    reserveBooking: 'Reserve booking',
  },
};
