// docs/08-STATE-MANAGEMENT.md sections 8.1-8.3, ADR-008, ADR-017, docs/04-DOMAIN-MODEL.md
// section 7. Store tests seed the OTHER stores this one reads via getState() directly through
// their own setState, matching the makeX-with-overrides fixture convention already used in
// src/domain/selectors/*.test.ts, rather than routing through the full buildDemoDataset seed.
import { beforeEach, describe, expect, it } from 'vitest';
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
