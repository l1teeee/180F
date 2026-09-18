// Pure selectors over the booking ledger - docs/08-STATE-MANAGEMENT.md section 4. No store
// or React import (docs/02-ARCHITECTURE.md section 5); data comes in as plain arguments.
//
// selectBookingEligibility/selectCancellationEligibility (below indexBookingsByCustomer) were
// moved here verbatim from src/stores/booking-eligibility.ts: docs/08-STATE-MANAGEMENT.md
// section 8.3 names this file as the only place booking rules exist, and Phase 2C could not
// put them here directly because this directory was read-only to it at the time.
import type {
  Booking,
  BookingEligibility,
  BookingFilters,
  BookingStatus,
  ClassSession,
  Customer,
  ISODate,
  ISODateTime,
  StudioSettings,
  WeeklyBookingPoint,
} from '@/domain/types';
import { addDaysISO, formatWeekdayShort, lastNISODates } from '@/lib/dates';
import { selectSessionOccupancy } from './sessions';

export function indexBookingsBySession(bookings: Booking[]): Map<string, Booking[]> {
  const index = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = index.get(booking.sessionId);
    if (list) {
      list.push(booking);
    } else {
      index.set(booking.sessionId, [booking]);
    }
  }
  return index;
}

export function indexBookingsByCustomer(bookings: Booking[]): Map<string, Booking[]> {
  const index = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = index.get(booking.customerId);
    if (list) {
      list.push(booking);
    } else {
      index.set(booking.customerId, [booking]);
    }
  }
  return index;
}

export function selectBookingsBySession(bookings: Booking[], sessionId: string): Booking[] {
  return bookings.filter((booking) => booking.sessionId === sessionId);
}

export function selectBookingsByCustomer(bookings: Booking[], customerId: string): Booking[] {
  return bookings.filter((booking) => booking.customerId === customerId);
}

export function selectBookingsByClass(bookings: Booking[], sessions: ClassSession[], classTypeId: string): Booking[] {
  const sessionIds = new Set(
    sessions.filter((session) => session.classTypeId === classTypeId).map((session) => session.id),
  );
  return bookings.filter((booking) => sessionIds.has(booking.sessionId));
}

export function selectTodayBookings(bookings: Booking[], sessions: ClassSession[], demoToday: ISODate): Booking[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  return bookings.filter((booking) => sessionById.get(booking.sessionId)?.date === demoToday);
}

export function selectRecentBookings(bookings: Booking[], limit = 6): Booking[] {
  return [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

// ADR-023: a booking counts toward a day when its session is on that day and its status is
// confirmed or pending - the same rule that decides whether it occupies a spot (ADR-008).
// Cancelled and waitlisted bookings never count. This is the one place that definition lives:
// selectDashboardKpis's todayBookings/vs-yesterday delta (dashboard.ts) and
// selectWeeklyBookingTrend below both read this map rather than each counting its own way.
export function selectBookingCountsByDate(bookings: Booking[], sessions: ClassSession[]): Map<ISODate, number> {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const countByDate = new Map<ISODate, number>();
  for (const booking of bookings) {
    if (booking.status !== 'confirmed' && booking.status !== 'pending') continue;
    const date = sessionById.get(booking.sessionId)?.date;
    if (!date) continue;
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }
  return countByDate;
}

// Exactly 7 points ending on demoToday, chronological order.
export function selectWeeklyBookingTrend(
  bookings: Booking[],
  sessions: ClassSession[],
  demoToday: ISODate,
): WeeklyBookingPoint[] {
  const countByDate = selectBookingCountsByDate(bookings, sessions);

  return lastNISODates(demoToday, 7).map((date) => ({
    date,
    label: formatWeekdayShort(date),
    bookings: countByDate.get(date) ?? 0,
  }));
}

// All four filters combine as an AND; 'all' is a no-op for status/source (docs/11-TEST-PLAN.md
// section 3). `query` matches the booking's customer name, case-insensitively.
export function filterBookings(
  bookings: Booking[],
  sessions: ClassSession[],
  customers: Customer[],
  filters: BookingFilters,
): Booking[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const query = filters.query.trim().toLowerCase();

  return bookings.filter((booking) => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.source !== 'all' && booking.source !== filters.source) return false;
    if (filters.date && sessionById.get(booking.sessionId)?.date !== filters.date) return false;
    if (query) {
      const customerName = customerById.get(booking.customerId)?.name ?? '';
      if (!customerName.toLowerCase().includes(query)) return false;
    }
    return true;
  });
}

// Derived from BookingEligibility itself so the two can never drift apart.
export type BookingRejectionReason = Extract<BookingEligibility, { allowed: false }>['reason'];

function reject(reason: BookingRejectionReason, message: string): BookingEligibility {
  return { allowed: false, reason, message };
}

export interface BookingEligibilityParams {
  session: ClassSession;
  customer: Customer;
  bookings: Booking[]; // the full ledger - the daily limit needs other sessions' dates too
  sessions: ClassSession[]; // resolves those other bookings' session dates
  settings: StudioSettings;
  demoNow: ISODateTime;
  requestedStatus: Extract<BookingStatus, 'confirmed' | 'pending' | 'waitlist'>;
}

// docs/08-STATE-MANAGEMENT.md section 8.3: the only place booking rules exist. Both the UI
// (to disable a control and explain why) and every store action (to reject) call this, so a
// disabled button and a rejected action can never disagree.
export function selectBookingEligibility(params: BookingEligibilityParams): BookingEligibility {
  const { session, customer, bookings, sessions, settings, demoNow, requestedStatus } = params;

  if (session.status === 'cancelled') {
    return reject('session_cancelled', 'This session has been cancelled.');
  }

  // Comparable to demoNow by plain string comparison: both are the same fixed-offset
  // 'YYYY-MM-DDTHH:mm:ss.sss-05:00' shape lib/dates.ts's buildISODateTime produces.
  const sessionStartsAt = `${session.date}T${session.startTime}:00.000-05:00`;
  if (sessionStartsAt <= demoNow) {
    return reject('session_started', 'This session has already started.');
  }

  const bookingsForSession = bookings.filter((booking) => booking.sessionId === session.id);
  const isFull = selectSessionOccupancy(session, bookingsForSession).occupancyState === 'full';

  if (requestedStatus === 'waitlist') {
    if (!settings.booking.waitlistEnabled) {
      return reject('waitlist_disabled', 'Waitlist is turned off for this studio.');
    }
    // docs/04-DOMAIN-MODEL.md section 7 invariant 5: a waitlist booking may only be created
    // while the session is full - it is not an alternate way to book an open session.
    if (!isFull) {
      return reject('waitlist_not_available', 'This session still has open spots.');
    }
  } else if (isFull) {
    return reject('session_full', 'This session is full.');
  }

  const hasActiveBookingForSession = bookingsForSession.some(
    (booking) => booking.customerId === customer.id && booking.status !== 'cancelled',
  );
  if (hasActiveBookingForSession) {
    return reject('already_booked', 'This customer already has a booking for this session.');
  }

  // ADR-024: the daily limit counts seats, not intentions - only confirmed and pending bookings
  // (the same statuses ADR-008 counts as occupying a spot). A waitlist entry never consumes a
  // seat, so an existing one never counts toward this tally, and a new waitlist request is never
  // itself capped by it - "two classes a day, not two hopes a day".
  if (requestedStatus !== 'waitlist') {
    const sessionDateById = new Map(sessions.map((s) => [s.id, s.date]));
    const seatsBookedOnSameDay = bookings.filter((booking) => {
      if (booking.customerId !== customer.id) return false;
      if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
      if (booking.sessionId === session.id) return false; // already covered by already_booked above
      return sessionDateById.get(booking.sessionId) === session.date;
    }).length;
    if (seatsBookedOnSameDay >= settings.booking.maxReservationsPerDay) {
      return reject(
        'daily_limit_reached',
        `This customer already has ${settings.booking.maxReservationsPerDay} booking(s) on this day.`,
      );
    }
  }

  const today = demoNow.slice(0, 10);
  const latestBookableDate = addDaysISO(today, settings.booking.advanceBookingDays);
  if (session.date > latestBookableDate) {
    return reject(
      'outside_booking_window',
      `Bookings open ${settings.booking.advanceBookingDays} days in advance.`,
    );
  }

  return { allowed: true };
}

export type CancellationRejectionReason = 'already_cancelled' | 'outside_cancellation_window';

export type CancellationEligibility =
  | { allowed: true }
  | { allowed: false; reason: CancellationRejectionReason; message: string };

export interface CancellationEligibilityParams {
  booking: Booking;
  session: ClassSession;
  settings: StudioSettings;
  demoNow: ISODateTime;
  // Admin actions may pass true to skip the notice-window check; the public flow never does
  // (docs/08 section 8.3).
  override?: boolean;
}

export function selectCancellationEligibility(params: CancellationEligibilityParams): CancellationEligibility {
  const { booking, session, settings, demoNow, override } = params;

  if (booking.status === 'cancelled') {
    return { allowed: false, reason: 'already_cancelled', message: 'This booking is already cancelled.' };
  }
  if (override) {
    return { allowed: true };
  }

  // Parsing two fixed-offset ISO strings to diff them in milliseconds is not the "new Date()
  // reads the wall clock" pattern ADR-018 confines to hydrateDemo/lib/dates.ts - both values
  // here are already-resolved, deterministic strings, not the live clock.
  const sessionStartsAt = `${session.date}T${session.startTime}:00.000-05:00`;
  const hoursUntilStart = (new Date(sessionStartsAt).getTime() - new Date(demoNow).getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart < settings.booking.cancellationWindowHours) {
    return {
      allowed: false,
      reason: 'outside_cancellation_window',
      message: `Cancellations require at least ${settings.booking.cancellationWindowHours} hours' notice.`,
    };
  }

  return { allowed: true };
}
