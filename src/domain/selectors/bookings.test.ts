// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession, Customer, StudioSettings } from '@/domain/types';
import {
  filterBookings,
  indexBookingsByCustomer,
  indexBookingsBySession,
  selectBookingCountsByDate,
  selectBookingEligibility,
  selectPromotionEligibility,
  selectRecentBookings,
} from './bookings';

const SESSIONS: ClassSession[] = [
  { id: 'ses-1', classTypeId: 'ct-a', instructorId: 'ins-01', date: '2026-09-17', startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled' },
  { id: 'ses-2', classTypeId: 'ct-a', instructorId: 'ins-01', date: '2026-09-18', startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled' },
];

const CUSTOMERS: Customer[] = [
  { id: 'cus-0001', name: 'Jamie Rivera', email: 'jamie@demo.180fitness.app', phone: '+57 300 000 0001', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
  { id: 'cus-0002', name: 'Alex Morgan', email: 'alex@demo.180fitness.app', phone: '+57 300 000 0002', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
];

const BOOKINGS: Booking[] = [
  { id: 'bkg-1', customerId: 'cus-0001', sessionId: 'ses-1', status: 'confirmed', source: 'website', createdAt: '2026-09-01T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
  { id: 'bkg-2', customerId: 'cus-0002', sessionId: 'ses-1', status: 'pending', source: 'whatsapp', createdAt: '2026-09-02T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
  { id: 'bkg-3', customerId: 'cus-0001', sessionId: 'ses-2', status: 'cancelled', source: 'reception', createdAt: '2026-09-03T09:00:00.000-05:00', checkedInAt: null, cancelledAt: '2026-09-03T10:00:00.000-05:00' },
  { id: 'bkg-4', customerId: 'cus-0002', sessionId: 'ses-2', status: 'waitlist', source: 'instagram', createdAt: '2026-09-04T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
];

describe('filterBookings', () => {
  it('status "all" and source "all" are no-ops', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: '', status: 'all', source: 'all', date: null });
    expect(result).toHaveLength(4);
  });

  it('a filter set matching nothing returns [], not undefined', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: 'nobody', status: 'all', source: 'all', date: null });
    expect(result).toEqual([]);
  });

  it('query matches the booking customer name, case-insensitively', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: 'jamie', status: 'all', source: 'all', date: null });
    expect(result.map((b) => b.id)).toEqual(['bkg-1', 'bkg-3']);
  });

  it('all four filters combine as an AND, each narrowing independently', () => {
    // Only bkg-2 is: pending, whatsapp, on 2026-09-17, customer "Alex Morgan"
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, {
      query: 'morgan',
      status: 'pending',
      source: 'whatsapp',
      date: '2026-09-17',
    });
    expect(result.map((b) => b.id)).toEqual(['bkg-2']);
  });

  it('narrows to [] when one of the four combined filters excludes every match', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, {
      query: 'morgan',
      status: 'pending',
      source: 'whatsapp',
      date: '2026-09-18', // wrong date for bkg-2
    });
    expect(result).toEqual([]);
  });
});

describe('indexBookingsBySession / indexBookingsByCustomer', () => {
  it('groups bookings by session id', () => {
    const index = indexBookingsBySession(BOOKINGS);
    expect(index.get('ses-1')?.map((b) => b.id)).toEqual(['bkg-1', 'bkg-2']);
    expect(index.get('ses-2')?.map((b) => b.id)).toEqual(['bkg-3', 'bkg-4']);
  });

  it('groups bookings by customer id', () => {
    const index = indexBookingsByCustomer(BOOKINGS);
    expect(index.get('cus-0001')?.map((b) => b.id)).toEqual(['bkg-1', 'bkg-3']);
  });
});

describe('selectRecentBookings', () => {
  it('returns the most recently created bookings first, limited to `limit`', () => {
    const result = selectRecentBookings(BOOKINGS, 2);
    expect(result.map((b) => b.id)).toEqual(['bkg-4', 'bkg-3']);
  });
});

describe('selectBookingCountsByDate', () => {
  it('counts only confirmed and pending bookings per session date (ADR-023)', () => {
    const counts = selectBookingCountsByDate(BOOKINGS, SESSIONS);
    // ses-1 / 2026-09-17: bkg-1 confirmed + bkg-2 pending
    expect(counts.get('2026-09-17')).toBe(2);
    // ses-2 / 2026-09-18: bkg-3 cancelled, bkg-4 waitlist - neither counts, so no entry at all
    expect(counts.has('2026-09-18')).toBe(false);
  });
});

// Shared by both describe blocks below - selectPromotionEligibility routes through
// selectBookingEligibility (ADR-024 point 3), so its tests need the same session/customer/
// settings/booking fixtures.
const ELIGIBILITY_DEMO_NOW = '2026-09-17T09:00:00.000-05:00';

function makeEligibilitySettings(overrides: Partial<StudioSettings['booking']> = {}): StudioSettings {
  return {
    general: {
      studioName: '180 Fitness Studio',
      email: 'hello@180fitness.app',
      phone: '+57 601 000 0180',
      address: 'Carrera 11 # 93-45, Bogotá',
      timezone: 'America/Bogota',
    },
    booking: { cancellationWindowHours: 12, maxReservationsPerDay: 2, waitlistEnabled: true, advanceBookingDays: 14, ...overrides },
    notifications: { whatsappConfirmations: true, emailConfirmations: false, reminderHoursBefore: 24 },
    branding: { logo: null, primaryColor: '#7869D4', accentColor: '#F5D889' },
  };
}

function makeEligibilityCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cus-a',
    name: 'Customer A',
    email: 'customer-a@demo.180fitness.app',
    phone: '+57 300 000 0001',
    avatar: null,
    status: 'active',
    membershipId: 'plan-unlimited',
    joinedAt: '2026-01-01',
    ...overrides,
  };
}

function makeDaySession(overrides: Partial<ClassSession> = {}): ClassSession {
  return { id: 'ses-1', classTypeId: 'ct-a', instructorId: 'ins-01', date: '2026-09-18', startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled', ...overrides };
}

function makeDayBooking(overrides: Partial<Booking> = {}): Booking {
  return { id: 'bkg-x', customerId: 'cus-a', sessionId: 'ses-1', status: 'confirmed', source: 'website', createdAt: ELIGIBILITY_DEMO_NOW, checkedInAt: null, cancelledAt: null, ...overrides };
}

describe('selectBookingEligibility - daily limit governs seats, not waitlist entries (ADR-024)', () => {
  const DEMO_NOW = ELIGIBILITY_DEMO_NOW;
  const makeSettings = makeEligibilitySettings;
  const makeCustomer = makeEligibilityCustomer;

  it('allows a waitlist join even when the customer already holds maxReservationsPerDay confirmed seats that day', () => {
    const targetSession = makeDaySession({ id: 'ses-target', capacity: 1 });
    const otherSessions: ClassSession[] = [
      targetSession,
      makeDaySession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' }),
      makeDaySession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' }),
    ];
    const customer = makeCustomer();
    const bookings: Booking[] = [
      makeDayBooking({ id: 'bkg-1', sessionId: 'ses-1', status: 'confirmed' }),
      makeDayBooking({ id: 'bkg-2', sessionId: 'ses-2', status: 'confirmed' }),
      // Someone else holds the target session's only spot, so it is full.
      makeDayBooking({ id: 'bkg-3', customerId: 'cus-other', sessionId: targetSession.id, status: 'confirmed' }),
    ];

    const result = selectBookingEligibility({
      session: targetSession,
      customer,
      bookings,
      sessions: otherSessions,
      settings: makeSettings({ maxReservationsPerDay: 2 }),
      demoNow: DEMO_NOW,
      requestedStatus: 'waitlist',
    });

    expect(result.allowed).toBe(true);
  });

  it('does not count an existing waitlist entry toward the daily seat tally for a new confirmed booking', () => {
    const targetSession = makeDaySession({ id: 'ses-target', capacity: 10 });
    const otherSessions: ClassSession[] = [
      targetSession,
      makeDaySession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' }),
      makeDaySession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' }),
    ];
    const customer = makeCustomer();
    const bookings: Booking[] = [
      makeDayBooking({ id: 'bkg-1', sessionId: 'ses-1', status: 'confirmed' }), // one real seat
      makeDayBooking({ id: 'bkg-2', sessionId: 'ses-2', status: 'waitlist' }), // a hope, not a seat
    ];

    const result = selectBookingEligibility({
      session: targetSession,
      customer,
      bookings,
      sessions: otherSessions,
      settings: makeSettings({ maxReservationsPerDay: 2 }),
      demoNow: DEMO_NOW,
      requestedStatus: 'confirmed',
    });

    expect(result.allowed).toBe(true);
  });

  it('still rejects a confirmed booking once the customer already holds maxReservationsPerDay seats that day', () => {
    const targetSession = makeDaySession({ id: 'ses-target', capacity: 10 });
    const otherSessions: ClassSession[] = [
      targetSession,
      makeDaySession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' }),
      makeDaySession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' }),
    ];
    const customer = makeCustomer();
    const bookings: Booking[] = [
      makeDayBooking({ id: 'bkg-1', sessionId: 'ses-1', status: 'confirmed' }),
      makeDayBooking({ id: 'bkg-2', sessionId: 'ses-2', status: 'pending' }),
    ];

    const result = selectBookingEligibility({
      session: targetSession,
      customer,
      bookings,
      sessions: otherSessions,
      settings: makeSettings({ maxReservationsPerDay: 2 }),
      demoNow: DEMO_NOW,
      requestedStatus: 'confirmed',
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('daily_limit_reached');
  });
});

describe('selectPromotionEligibility - promotion satisfies the same rules as a new confirmed booking (independent audit defect 2, ADR-024 point 3)', () => {
  const DEMO_NOW = ELIGIBILITY_DEMO_NOW;
  const makeSettings = makeEligibilitySettings;
  const makeCustomer = makeEligibilityCustomer;

  it('excludes the booking being promoted from its own already_booked check', () => {
    // A naive selectBookingEligibility call against the full, unfiltered ledger (including this
    // very waitlist row) would reject every promotion as already_booked - the row itself is a
    // non-cancelled booking for this customer on this session.
    const session = makeDaySession({ id: 'ses-target', capacity: 10 });
    const customer = makeCustomer();
    const waitlisted = makeDayBooking({ id: 'bkg-wait', sessionId: session.id, status: 'waitlist' });

    const result = selectPromotionEligibility({
      bookingId: waitlisted.id,
      bookingStatus: waitlisted.status,
      session,
      customer,
      bookings: [waitlisted],
      sessions: [session],
      settings: makeSettings(),
      demoNow: DEMO_NOW,
    });

    expect(result.allowed).toBe(true);
  });

  it('refuses a booking that is not on the waitlist', () => {
    const session = makeDaySession({ id: 'ses-target', capacity: 10 });
    const customer = makeCustomer();
    const confirmed = makeDayBooking({ id: 'bkg-confirmed', sessionId: session.id, status: 'confirmed' });

    const result = selectPromotionEligibility({
      bookingId: confirmed.id,
      bookingStatus: confirmed.status,
      session,
      customer,
      bookings: [confirmed],
      sessions: [session],
      settings: makeSettings(),
      demoNow: DEMO_NOW,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('not_waitlisted');
  });

  it('refuses promotion once the customer already holds maxReservationsPerDay seats that day, even with a free seat in the target session', () => {
    const targetSession = makeDaySession({ id: 'ses-target', capacity: 10 });
    const otherSessions: ClassSession[] = [
      targetSession,
      makeDaySession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' }),
      makeDaySession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' }),
    ];
    const customer = makeCustomer();
    const waitlisted = makeDayBooking({ id: 'bkg-wait', sessionId: targetSession.id, status: 'waitlist' });
    const bookings: Booking[] = [
      waitlisted,
      makeDayBooking({ id: 'bkg-1', sessionId: 'ses-1', status: 'confirmed' }),
      makeDayBooking({ id: 'bkg-2', sessionId: 'ses-2', status: 'pending' }),
    ];

    const result = selectPromotionEligibility({
      bookingId: waitlisted.id,
      bookingStatus: waitlisted.status,
      session: targetSession,
      customer,
      bookings,
      sessions: otherSessions,
      settings: makeSettings({ maxReservationsPerDay: 2 }),
      demoNow: DEMO_NOW,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('daily_limit_reached');
  });

  it('refuses promotion when the session has no free seat', () => {
    const session = makeDaySession({ id: 'ses-target', capacity: 1 });
    const customer = makeCustomer();
    const waitlisted = makeDayBooking({ id: 'bkg-wait', sessionId: session.id, status: 'waitlist' });
    const bookings: Booking[] = [
      waitlisted,
      makeDayBooking({ id: 'bkg-holds-seat', customerId: 'cus-other', sessionId: session.id, status: 'confirmed' }),
    ];

    const result = selectPromotionEligibility({
      bookingId: waitlisted.id,
      bookingStatus: waitlisted.status,
      session,
      customer,
      bookings,
      sessions: [session],
      settings: makeSettings(),
      demoNow: DEMO_NOW,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('session_full');
  });

  it('refuses promotion when the session has already started', () => {
    const session = makeDaySession({ id: 'ses-target', capacity: 10, date: '2026-09-17', startTime: '08:00', endTime: '08:50' });
    const customer = makeEligibilityCustomer();
    const waitlisted = makeDayBooking({ id: 'bkg-wait', sessionId: session.id, status: 'waitlist' });

    const result = selectPromotionEligibility({
      bookingId: waitlisted.id,
      bookingStatus: waitlisted.status,
      session,
      customer,
      bookings: [waitlisted],
      sessions: [session],
      settings: makeSettings(),
      demoNow: DEMO_NOW, // 2026-09-17T09:00, after the session's 08:00 start
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('session_started');
  });

  it('refuses promotion when the session has been cancelled', () => {
    const session = makeDaySession({ id: 'ses-target', capacity: 10, status: 'cancelled' });
    const customer = makeEligibilityCustomer();
    const waitlisted = makeDayBooking({ id: 'bkg-wait', sessionId: session.id, status: 'waitlist' });

    const result = selectPromotionEligibility({
      bookingId: waitlisted.id,
      bookingStatus: waitlisted.status,
      session,
      customer,
      bookings: [waitlisted],
      sessions: [session],
      settings: makeSettings(),
      demoNow: DEMO_NOW,
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe('session_cancelled');
  });
});
