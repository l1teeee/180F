// docs/08-STATE-MANAGEMENT.md sections 8.1-8.3, ADR-008, ADR-017, docs/04-DOMAIN-MODEL.md
// section 7. Store tests seed the OTHER stores this one reads via getState() directly through
// their own setState, matching the makeX-with-overrides fixture convention already used in
// src/domain/selectors/*.test.ts, rather than routing through the full buildDemoDataset seed.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Booking, ClassSession, Customer, StudioSettings } from '@/domain/types';
import { useBookingStore } from './booking.store';
import { useCustomerStore } from './customer.store';
import { useDemoRuntimeStore } from './demo-runtime.store';
import { useSessionStore } from './session.store';
import { useSettingsStore } from './settings.store';

const DEMO_TODAY = '2026-09-17';
const DEMO_NOW = '2026-09-17T09:00:00.000-05:00';

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-test',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '10:50',
    capacity: 10,
    room: 'Studio A',
    status: 'scheduled',
    ...overrides,
  };
}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
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

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-existing',
    customerId: 'cus-a',
    sessionId: 'ses-test',
    status: 'confirmed',
    source: 'website',
    createdAt: DEMO_NOW,
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

function makeSettings(overrides: Partial<StudioSettings['booking']> = {}): StudioSettings {
  return {
    general: {
      studioName: '180 Fitness Studio',
      email: 'hello@180fitness.app',
      phone: '+57 601 000 0180',
      address: 'Carrera 11 # 93-45, Bogotá',
      timezone: 'America/Bogota',
    },
    booking: {
      cancellationWindowHours: 12,
      maxReservationsPerDay: 2,
      waitlistEnabled: true,
      advanceBookingDays: 14,
      ...overrides,
    },
    notifications: { whatsappConfirmations: true, emailConfirmations: false, reminderHoursBefore: 24 },
    branding: { logo: null, primaryColor: '#7869D4', accentColor: '#F5D889' },
  };
}

const CUSTOMER_A = makeCustomer({ id: 'cus-a', email: 'customer-a@demo.180fitness.app' });
const CUSTOMER_B = makeCustomer({ id: 'cus-b', email: 'customer-b@demo.180fitness.app' });

function seedCommonStores(session: ClassSession, customers: Customer[] = [CUSTOMER_A, CUSTOMER_B]) {
  useSessionStore.setState({ sessions: [session] });
  useCustomerStore.setState({ customers });
  useSettingsStore.setState({ settings: makeSettings() });
  useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
}

beforeEach(() => {
  useBookingStore.setState({ bookings: [], mutation: 'idle' });
  useSessionStore.setState({ sessions: [] });
  useCustomerStore.setState({ customers: [] });
  useSettingsStore.setState({ settings: null });
  useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });
});

describe('createBooking', () => {
  it('rejects a confirmed booking on a full session', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session);
    useBookingStore.setState({ bookings: [makeBooking({ sessionId: session.id })] });

    const result = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_B.id, sessionId: session.id, source: 'website' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('session_full');
    expect(useBookingStore.getState().bookings).toHaveLength(1);
  });

  it('accepts a waitlist booking on the same full session', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session);
    useBookingStore.setState({ bookings: [makeBooking({ sessionId: session.id })] });

    const result = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_B.id, sessionId: session.id, source: 'website', status: 'waitlist' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.booking.status).toBe('waitlist');
    expect(useBookingStore.getState().bookings).toHaveLength(2);
  });

  it('rejects a duplicate active booking for the same customer and session', async () => {
    const session = makeSession({ capacity: 10 });
    seedCommonStores(session);
    useBookingStore.setState({ bookings: [makeBooking({ sessionId: session.id })] });

    const result = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_A.id, sessionId: session.id, source: 'website' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('already_booked');
    expect(useBookingStore.getState().bookings).toHaveLength(1);
  });
});

describe('createBooking concurrency (ADR-017)', () => {
  it('exactly one of two concurrent requests for the last spot succeeds, and capacity is never exceeded', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session);

    const [resultA, resultB] = await Promise.all([
      useBookingStore.getState().createBooking({ customerId: CUSTOMER_A.id, sessionId: session.id, source: 'website' }),
      useBookingStore.getState().createBooking({ customerId: CUSTOMER_B.id, sessionId: session.id, source: 'website' }),
    ]);

    const successes = [resultA, resultB].filter((result) => result.ok);
    expect(successes).toHaveLength(1);

    const occupied = useBookingStore
      .getState()
      .bookings.filter((booking) => booking.status === 'confirmed' || booking.status === 'pending');
    expect(occupied).toHaveLength(1);
    expect(occupied.length).toBeLessThanOrEqual(session.capacity);
  });
});

describe('cancelBooking', () => {
  it('releases the spot, stamps cancelledAt, and leaves occupancy consistent for the next booking', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session);
    useBookingStore.setState({ bookings: [makeBooking({ sessionId: session.id })] });

    const cancelResult = await useBookingStore.getState().cancelBooking('bkg-existing');
    expect(cancelResult.ok).toBe(true);

    const cancelled = useBookingStore.getState().bookings.find((b) => b.id === 'bkg-existing');
    expect(cancelled?.status).toBe('cancelled');
    // Invariant 7: cancelledAt is non-null exactly when status === 'cancelled'.
    expect(cancelled?.cancelledAt).toBe(DEMO_NOW);

    // Occupancy is derived from the ledger (ADR-006/ADR-008), never a separate counter, so the
    // real proof the spot re-opened is that a new confirmed booking on the same (capacity 1)
    // session now succeeds instead of being rejected as full.
    const nextResult = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_B.id, sessionId: session.id, source: 'website' });

    expect(nextResult.ok).toBe(true);
    const finalBookings = useBookingStore.getState().bookings;
    expect(finalBookings.filter((b) => b.status !== 'cancelled')).toHaveLength(1);
    // A booking that was never cancelled carries a null cancelledAt.
    const newBooking = finalBookings.find((b) => b.status === 'confirmed');
    expect(newBooking?.cancelledAt).toBeNull();
  });
});

describe('booking id uniqueness across entry points (docs/04 section 6, single source of ids)', () => {
  it('creates a booking through the admin path and one through the public path with different ids', async () => {
    const session = makeSession({ capacity: 10 });
    seedCommonStores(session);

    const adminResult = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_A.id, sessionId: session.id, source: 'reception' });
    expect(adminResult.ok).toBe(true);

    const publicResult = await useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'Public Person',
      email: 'public-person@example.com',
      phone: '+57 300 000 9003',
    });
    expect(publicResult.ok).toBe(true);

    if (adminResult.ok && publicResult.ok) {
      expect(adminResult.booking.id).not.toBe(publicResult.booking.id);
    }
  });
});

describe('createBooking waitlist requests are not capped by the daily reservation limit (ADR-024)', () => {
  it('allows joining the waitlist even when the customer already has maxReservationsPerDay confirmed bookings that day', async () => {
    const fullSession = makeSession({ id: 'ses-full', capacity: 1 });
    const sessionOne = makeSession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' });
    const sessionTwo = makeSession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' });
    useSessionStore.setState({ sessions: [fullSession, sessionOne, sessionTwo] });
    useCustomerStore.setState({ customers: [CUSTOMER_A, CUSTOMER_B] });
    useSettingsStore.setState({ settings: makeSettings({ maxReservationsPerDay: 2 }) });
    useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
    useBookingStore.setState({
      bookings: [
        makeBooking({ id: 'bkg-seat-1', customerId: CUSTOMER_A.id, sessionId: sessionOne.id }),
        makeBooking({ id: 'bkg-seat-2', customerId: CUSTOMER_A.id, sessionId: sessionTwo.id }),
        makeBooking({ id: 'bkg-holds-seat', customerId: CUSTOMER_B.id, sessionId: fullSession.id }),
      ],
    });

    const result = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_A.id, sessionId: fullSession.id, source: 'reception', status: 'waitlist' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.booking.status).toBe('waitlist');
  });

  it('still rejects a third confirmed booking once the customer already holds two seats that day', async () => {
    const thirdSession = makeSession({ id: 'ses-3', capacity: 10 });
    const sessionOne = makeSession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' });
    const sessionTwo = makeSession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' });
    useSessionStore.setState({ sessions: [thirdSession, sessionOne, sessionTwo] });
    useCustomerStore.setState({ customers: [CUSTOMER_A, CUSTOMER_B] });
    useSettingsStore.setState({ settings: makeSettings({ maxReservationsPerDay: 2 }) });
    useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
    useBookingStore.setState({
      bookings: [
        makeBooking({ id: 'bkg-seat-1', customerId: CUSTOMER_A.id, sessionId: sessionOne.id }),
        makeBooking({ id: 'bkg-seat-2', customerId: CUSTOMER_A.id, sessionId: sessionTwo.id }),
      ],
    });

    const result = await useBookingStore
      .getState()
      .createBooking({ customerId: CUSTOMER_A.id, sessionId: thirdSession.id, source: 'reception' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('daily_limit_reached');
  });
});

describe('promoteFromWaitlist (ADR-024)', () => {
  it('cancelling a confirmed booking on a full session opens a seat the earliest waitlisted booking can be promoted into', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session, [CUSTOMER_A, CUSTOMER_B, makeCustomer({ id: 'cus-c', email: 'customer-c@demo.180fitness.app' })]);
    useBookingStore.setState({
      bookings: [
        makeBooking({ id: 'bkg-confirmed', customerId: CUSTOMER_A.id, sessionId: session.id, status: 'confirmed' }),
        makeBooking({ id: 'bkg-wait-1', customerId: CUSTOMER_B.id, sessionId: session.id, status: 'waitlist', createdAt: '2026-09-17T08:00:00.000-05:00' }),
        makeBooking({ id: 'bkg-wait-2', customerId: 'cus-c', sessionId: session.id, status: 'waitlist', createdAt: '2026-09-17T08:05:00.000-05:00' }),
      ],
    });

    const cancelResult = await useBookingStore.getState().cancelBooking('bkg-confirmed', { override: true });
    expect(cancelResult.ok).toBe(true);

    const promoteResult = await useBookingStore.getState().promoteFromWaitlist('bkg-wait-1');
    expect(promoteResult.ok).toBe(true);
    if (promoteResult.ok) expect(promoteResult.booking.status).toBe('confirmed');

    const bookings = useBookingStore.getState().bookings;
    expect(bookings.find((b) => b.id === 'bkg-confirmed')?.status).toBe('cancelled');
    expect(bookings.find((b) => b.id === 'bkg-wait-1')?.status).toBe('confirmed');
    expect(bookings.find((b) => b.id === 'bkg-wait-2')?.status).toBe('waitlist');

    // Occupancy is derived from the ledger (ADR-006/ADR-008): exactly one confirmed/pending
    // booking now occupies the capacity-1 session, so a second promotion has nothing to promote
    // into.
    const occupied = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
    expect(occupied).toHaveLength(1);

    const secondPromote = await useBookingStore.getState().promoteFromWaitlist('bkg-wait-2');
    expect(secondPromote.ok).toBe(false);
    if (!secondPromote.ok) expect(secondPromote.reason).toBe('session_full');
  });

  // Independent audit defect 2: promotion previously re-checked capacity only. These reproduce
  // the reviewer's scenario ("accepted a third seat with a two-seat daily limit, plus entries
  // for past and cancelled sessions") one rule at a time, routed through the same
  // selectPromotionEligibility/selectBookingEligibility the create path uses.
  it('refuses promotion when it would push the customer over the daily reservation limit', async () => {
    const targetSession = makeSession({ id: 'ses-target', capacity: 2 });
    const sessionOne = makeSession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' });
    const sessionTwo = makeSession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' });
    useSessionStore.setState({ sessions: [targetSession, sessionOne, sessionTwo] });
    useCustomerStore.setState({ customers: [CUSTOMER_A, CUSTOMER_B] });
    useSettingsStore.setState({ settings: makeSettings({ maxReservationsPerDay: 2 }) });
    useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
    useBookingStore.setState({
      bookings: [
        // Customer A already holds two seats today (the daily limit) on other sessions - the
        // target session itself has a free seat, so capacity alone would wrongly allow this.
        makeBooking({ id: 'bkg-seat-1', customerId: CUSTOMER_A.id, sessionId: sessionOne.id }),
        makeBooking({ id: 'bkg-seat-2', customerId: CUSTOMER_A.id, sessionId: sessionTwo.id }),
        makeBooking({ id: 'bkg-wait', customerId: CUSTOMER_A.id, sessionId: targetSession.id, status: 'waitlist' }),
      ],
    });

    const result = await useBookingStore.getState().promoteFromWaitlist('bkg-wait');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('daily_limit_reached');
    expect(useBookingStore.getState().bookings.find((b) => b.id === 'bkg-wait')?.status).toBe('waitlist');
  });

  it('refuses promotion when the session has already started', async () => {
    // DEMO_NOW is 09:00; a 08:00 start on the same day is already in the past.
    const session = makeSession({ capacity: 2, date: DEMO_TODAY, startTime: '08:00', endTime: '08:50' });
    seedCommonStores(session);
    useBookingStore.setState({
      bookings: [makeBooking({ id: 'bkg-wait', customerId: CUSTOMER_B.id, sessionId: session.id, status: 'waitlist' })],
    });

    const result = await useBookingStore.getState().promoteFromWaitlist('bkg-wait');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('session_started');
    expect(useBookingStore.getState().bookings.find((b) => b.id === 'bkg-wait')?.status).toBe('waitlist');
  });

  it('refuses promotion when the session has been cancelled', async () => {
    const session = makeSession({ capacity: 2, status: 'cancelled' });
    seedCommonStores(session);
    useBookingStore.setState({
      bookings: [makeBooking({ id: 'bkg-wait', customerId: CUSTOMER_B.id, sessionId: session.id, status: 'waitlist' })],
    });

    const result = await useBookingStore.getState().promoteFromWaitlist('bkg-wait');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('session_cancelled');
    expect(useBookingStore.getState().bookings.find((b) => b.id === 'bkg-wait')?.status).toBe('waitlist');
  });

  it('refuses promotion when the booking is not on the waitlist', async () => {
    const session = makeSession({ capacity: 2 });
    seedCommonStores(session);
    useBookingStore.setState({
      bookings: [makeBooking({ id: 'bkg-confirmed', customerId: CUSTOMER_A.id, sessionId: session.id, status: 'confirmed' })],
    });

    const result = await useBookingStore.getState().promoteFromWaitlist('bkg-confirmed');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_waitlisted');
  });
});

describe('createPublicBooking', () => {
  it('resolves the same customer across two calls with the same email; the second is rejected as a duplicate booking', async () => {
    const session = makeSession({ capacity: 10 });
    seedCommonStores(session, []);

    const first = await useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'Jo Public',
      email: 'JO@Example.com ',
      phone: '+57 300 000 9001',
    });
    expect(first.ok).toBe(true);
    expect(useCustomerStore.getState().customers).toHaveLength(1);

    const second = await useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'Jo Public',
      email: ' jo@example.com',
      phone: '+57 300 000 9001',
    });

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('already_booked');
    expect(useCustomerStore.getState().customers).toHaveLength(1);
    expect(useBookingStore.getState().bookings.filter((b) => b.status !== 'cancelled')).toHaveLength(1);
  });

  it('leaves no orphan customer when the booking is rejected (docs/08 section 8.2)', async () => {
    const session = makeSession({ capacity: 1 });
    seedCommonStores(session);
    useBookingStore.setState({ bookings: [makeBooking({ sessionId: session.id })] }); // session already full

    const result = await useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'New Public',
      email: 'new-public@example.com',
      phone: '+57 300 000 9002',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('session_full');
    expect(useCustomerStore.getState().customers.some((c) => c.email === 'new-public@example.com')).toBe(false);
  });
});

// Independent audit defect 1, reproduced end-to-end through the public flow: "After reload,
// Bob's booking used Alice's persisted customer ID, and Bob was never added." Uses the same
// vi.resetModules() technique as mock-booking-repository.test.ts and
// mock-customer-repository.test.ts - only localStorage, not module state, survives that reset,
// the same reset a real browser tab gets simply by being a separate page load. Every store this
// scenario touches is re-imported fresh alongside the booking store so they resolve to the same
// module-registry instances booking.store.ts itself calls internally.
describe('customer identity survives a reload across the public flow (independent audit defect 1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not let a second public customer's booking use a first, different customer's persisted id after a simulated reload", async () => {
    vi.resetModules();
    const tab1Booking = await import('./booking.store');
    const tab1Customer = await import('./customer.store');
    const tab1Session = await import('./session.store');
    const tab1Settings = await import('./settings.store');
    const tab1Runtime = await import('./demo-runtime.store');

    const session = makeSession({ capacity: 10 });
    tab1Session.useSessionStore.setState({ sessions: [session] });
    tab1Settings.useSettingsStore.setState({ settings: makeSettings() });
    tab1Runtime.useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });

    const aliceResult = await tab1Booking.useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'Alice',
      email: 'alice@example.com',
      phone: '+57 300 000 0001',
    });
    expect(aliceResult.ok).toBe(true);
    if (!aliceResult.ok) throw new Error('setup failed: Alice\'s booking was rejected');
    const alice = tab1Customer.useCustomerStore.getState().customers[0];
    expect(alice?.name).toBe('Alice');
    const aliceBooking = aliceResult.booking;

    // Simulated reload / second tab: every module re-evaluates fresh - a private in-memory id
    // counter would restart at zero here - but localStorage (where the id-sequence fix keeps its
    // state, and where ADR-022 keeps the demo snapshot) survives. setState below stands in for
    // hydrateDemo() restoring Alice's customer and booking from that snapshot into the
    // otherwise-empty fresh stores.
    vi.resetModules();
    const tab2Booking = await import('./booking.store');
    const tab2Customer = await import('./customer.store');
    const tab2Session = await import('./session.store');
    const tab2Settings = await import('./settings.store');
    const tab2Runtime = await import('./demo-runtime.store');

    tab2Session.useSessionStore.setState({ sessions: [session] });
    tab2Settings.useSettingsStore.setState({ settings: makeSettings() });
    tab2Runtime.useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
    tab2Customer.useCustomerStore.setState({ customers: [alice as NonNullable<typeof alice>] });
    tab2Booking.useBookingStore.setState({ bookings: [aliceBooking] });

    const bobResult = await tab2Booking.useBookingStore.getState().createPublicBooking({
      sessionId: session.id,
      name: 'Bob',
      email: 'bob@example.com',
      phone: '+57 300 000 0002',
    });

    expect(bobResult.ok).toBe(true);
    const customersAfter = tab2Customer.useCustomerStore.getState().customers;
    expect(customersAfter).toHaveLength(2); // Bob was added, not silently dropped.
    const bob = customersAfter.find((c) => c.email === 'bob@example.com');
    expect(bob).toBeDefined();
    expect(bob?.id).not.toBe(alice?.id);

    // The reviewer's exact failure: each booking must point at its own customer, not the other's.
    if (bobResult.ok) expect(bobResult.booking.customerId).toBe(bob?.id);
    const bookingsAfter = tab2Booking.useBookingStore.getState().bookings;
    expect(bookingsAfter.find((b) => b.customerId === alice?.id)).toBeDefined();
    expect(bookingsAfter.find((b) => b.customerId === bob?.id)).toBeDefined();
  });
});
