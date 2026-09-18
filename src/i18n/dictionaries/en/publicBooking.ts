// Owned by: public booking screens (src/components/booking/**, src/app/book/**). Checked
// against es/publicBooking.ts's key set with `satisfies Messages` (en/index.ts). English copy
// here is kept byte-identical to today's wording so e2e/ specs (which pin English) still match.
import type { BookingRejectionReason } from '@/domain/selectors';

// See es/publicBooking.ts's own comment: translates createPublicBooking's locale-free `reason`
// into English copy for the wizard's step 4. 'session_full' and the default case reuse the
// exact English wording customer-step.tsx already showed before this migration (byte-identical -
// no e2e spec pins these specifically, but there is no reason to reword them either).
function customerStepSubmitError(reason: BookingRejectionReason): string {
  switch (reason) {
    case 'session_full':
      return 'This time filled up while you were entering your details.';
    case 'session_cancelled':
      return 'This session has been cancelled.';
    case 'session_started':
      return 'This session has already started.';
    case 'already_booked':
      return 'You already have a booking for this session.';
    case 'daily_limit_reached':
      return 'You have reached the maximum number of bookings allowed for this day.';
    case 'outside_booking_window':
      return 'This booking is outside the advance-booking window.';
    case 'waitlist_disabled':
      return 'Waitlist is turned off for this studio.';
    case 'waitlist_not_available':
      return 'This session still has open spots.';
    case 'session_not_found':
      return 'We could not find this session.';
    default:
      return 'We could not complete your booking. Please try again.';
  }
}

export const publicBooking = {
  backToClass: 'Change class',
  backToDate: 'Change date',
  backToTime: 'Change time',
  loadError: "We couldn't load class availability.",

  classStep: {
    heading: 'Choose your class',
    subtitle: 'Pick a class to see its upcoming times.',
    durationMinutes: (n: number): string => `${n} min`,
    noSessionsAvailable: 'No sessions available',
    sessionsAvailable: (n: number): string => `${n} session${n === 1 ? '' : 's'} available`,
  },

  dateStep: {
    heading: 'Choose a date',
    subtitle: (className: string): string => `${className} · pick the day that works for you.`,
    availableDatesLabel: 'Available dates',
  },

  timeStep: {
    heading: 'Choose a time',
    emptyState: {
      title: 'No sessions available for this day',
      description:
        'Every session on this day has already started, or none has been scheduled yet. Pick another date.',
      action: 'Choose another date',
    },
    full: 'FULL',
    spotsLeft: (booked: number, capacity: number): string => `${booked} / ${capacity} spots`,
  },

  customerStep: {
    heading: 'Your details',
    nameLabel: 'Name',
    namePlaceholder: 'Jordan Rivera',
    phoneLabel: 'Phone',
    phonePlaceholder: '+57 300 000 0000',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    chooseAnotherTime: 'Choose a different time',
    submit: 'Confirm reservation',
    errors: {
      nameTooShort: 'Enter your full name',
      emailInvalid: 'Enter a valid email address',
      phoneTooShort: 'Enter a phone number with at least 7 digits',
      forReason: customerStepSubmitError,
    },
  },

  success: {
    heading: 'Your class is booked!',
    confirmationSent: 'Your confirmation has been sent by WhatsApp.',
    simulatedBadge: 'Simulated',
    classLabel: 'Class',
    dateLabel: 'Date',
    timeLabel: 'Time',
    locationLabel: 'Location',
    bookingIdLabel: 'Booking ID',
    statusLabel: 'Status',
    addToCalendar: 'Add to calendar',
    viewBooking: 'View booking',
    hideBooking: 'Hide booking',
    bookAnother: 'Book another class',
  },

  progress: {
    ariaLabel: 'Booking steps',
    steps: {
      class: 'Class',
      date: 'Date',
      time: 'Time',
      details: 'Details',
    },
  },

  occupancyStateLabel: {
    almost_full: 'Almost full',
  },
  bookingStatusLabel: {
    confirmed: 'Confirmed',
  },
};
