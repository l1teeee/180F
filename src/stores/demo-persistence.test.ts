// ADR-022. Covers the pieces demo-runtime.store.test.ts does not: snapshot validation
// (wrong version / wrong day / corrupt JSON / missing fields all discarded), the
// read/write/clear round trip, applySnapshot filling every store, the debounce, and the
// cross-tab event handler in isolation from any real `storage` event/window registration.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Booking, ClassSession, Customer, MembershipPlan, StudioSettings } from '@/domain/types';
import { useAutomationStore } from './automation.store';
import { useBookingStore } from './booking.store';
import { useCatalogStore } from './catalog.store';
import { useCustomerStore } from './customer.store';
import {
  applyCrossTabStorageEvent,
  clearSnapshot,
  readSnapshot,
  scheduleSnapshotWrite,
  snapshotStorageKey,
  writeSnapshot,
  type DemoSnapshot,
} from './demo-persistence';
import { useDemoRuntimeStore } from './demo-runtime.store';
import { useNotificationStore } from './notification.store';
import { useSessionStore } from './session.store';
import { useSettingsStore } from './settings.store';

const DEMO_TODAY = '2026-09-17';
const OTHER_DAY = '2026-09-18';

function makeSettings(): StudioSettings {
  return {
    general: { studioName: '180 Fitness Studio', email: 'hello@180fitness.app', phone: '', address: '', timezone: 'America/Bogota' },
    booking: { cancellationWindowHours: 12, maxReservationsPerDay: 2, waitlistEnabled: true, advanceBookingDays: 14 },
    notifications: { whatsappConfirmations: true, emailConfirmations: false, reminderHoursBefore: 24 },
    branding: { logo: null, primaryColor: '#7869D4', accentColor: '#F5D889' },
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-snap-1',
    customerId: 'cus-snap-1',
    sessionId: 'ses-snap-1',
    status: 'confirmed',
    source: 'website',
    createdAt: `${DEMO_TODAY}T09:00:00.000-05:00`,
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cus-snap-1',
    name: 'Customer Snap',
    email: 'customer-snap@demo.180fitness.app',
    phone: '+57 300 000 0002',
    avatar: null,
    status: 'active',
    membershipId: 'plan-unlimited',
    joinedAt: '2026-01-01',
    ...overrides,
  };
}

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-snap-1',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: DEMO_TODAY,
    startTime: '10:00',
    endTime: '10:50',
    capacity: 10,
    room: 'Studio A',
    status: 'scheduled',
    ...overrides,
  };
}

function makePlan(overrides: Partial<MembershipPlan> = {}): MembershipPlan {
  return {
    id: 'plan-unlimited',
    name: 'Unlimited',
    monthlyPrice: 69,
    billingPeriod: 'monthly',
    classLimit: null,
    benefits: [],
    accent: 'purple',
    ...overrides,
  };
}

function seedAllStores(): void {
  useBookingStore.setState({ bookings: [makeBooking()], mutation: 'idle' });
  useCustomerStore.setState({ customers: [makeCustomer()] });
  useSessionStore.setState({ sessions: [makeSession()] });
  useCatalogStore.setState({ organization: { id: 'org-1', logo: null }, classTypes: [], membershipPlans: [makePlan()] });
  useAutomationStore.setState({ automations: [], sending: null });
  useNotificationStore.setState({ notifications: [] });
  useSettingsStore.setState({ settings: makeSettings() });
  useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: `${DEMO_TODAY}T09:00:00.000-05:00`, error: null });
}

function clearAllStores(): void {
  useBookingStore.setState({ bookings: [], mutation: 'idle' });
  useCustomerStore.setState({ customers: [] });
  useSessionStore.setState({ sessions: [] });
  useCatalogStore.setState({ organization: null, classTypes: [], membershipPlans: [] });
  useAutomationStore.setState({ automations: [], sending: null });
  useNotificationStore.setState({ notifications: [] });
  useSettingsStore.setState({ settings: null });
  useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });
}

function makeValidSnapshot(overrides: Partial<DemoSnapshot> = {}): DemoSnapshot {
  return {
    version: 1,
    demoToday: DEMO_TODAY,
    bookings: [makeBooking()],
    customers: [makeCustomer()],
    sessions: [makeSession()],
    membershipPlans: [makePlan()],
    automations: [],
    notifications: [],
    settings: makeSettings(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  clearAllStores();
});

describe('readSnapshot', () => {
  it('returns null when nothing is stored', () => {
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('returns null for corrupt JSON and never throws', () => {
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), '{not json');
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('returns null for a different version', () => {
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), JSON.stringify({ ...makeValidSnapshot(), version: 2 }));
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('returns null for a snapshot keyed to a different day than requested', () => {
    // Stored under today's key but with a mismatched internal demoToday field - e.g. a bug or a
    // hand-edited value (ADR-022 "a different version... is discarded").
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), JSON.stringify({ ...makeValidSnapshot(), demoToday: OTHER_DAY }));
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('returns null when a required field is missing or the wrong shape', () => {
    const withoutBookings: Partial<DemoSnapshot> = makeValidSnapshot();
    delete withoutBookings.bookings;
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), JSON.stringify(withoutBookings));
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('returns the parsed snapshot when it is valid', () => {
    const snapshot = makeValidSnapshot();
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), JSON.stringify(snapshot));
    expect(readSnapshot(DEMO_TODAY)).toEqual(snapshot);
  });
});

describe('writeSnapshot / readSnapshot round trip', () => {
  it('serializes the seven mutable stores and reads the same data back', () => {
    seedAllStores();
    writeSnapshot(DEMO_TODAY);

    const snapshot = readSnapshot(DEMO_TODAY);
    expect(snapshot).not.toBeNull();
    expect(snapshot?.bookings).toEqual(useBookingStore.getState().bookings);
    expect(snapshot?.customers).toEqual(useCustomerStore.getState().customers);
    expect(snapshot?.sessions).toEqual(useSessionStore.getState().sessions);
    expect(snapshot?.membershipPlans).toEqual(useCatalogStore.getState().membershipPlans);
    expect(snapshot?.settings).toEqual(useSettingsStore.getState().settings);
  });

  it('never throws when localStorage.setItem rejects (e.g. quota exceeded)', () => {
    seedAllStores();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => writeSnapshot(DEMO_TODAY)).not.toThrow();
    setItemSpy.mockRestore();
  });
});

describe('clearSnapshot', () => {
  it('removes the key so a later readSnapshot finds nothing', () => {
    localStorage.setItem(snapshotStorageKey(DEMO_TODAY), JSON.stringify(makeValidSnapshot()));
    clearSnapshot(DEMO_TODAY);
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });
});

describe('scheduleSnapshotWrite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing before hydration has a demoToday', () => {
    scheduleSnapshotWrite();
    vi.advanceTimersByTime(1_000);
    expect(readSnapshot(DEMO_TODAY)).toBeNull();
  });

  it('debounces a burst of calls into exactly one write, ~250ms after the last one', () => {
    seedAllStores();

    scheduleSnapshotWrite();
    vi.advanceTimersByTime(100);
    scheduleSnapshotWrite(); // resets the debounce window
    vi.advanceTimersByTime(100);
    scheduleSnapshotWrite();

    vi.advanceTimersByTime(249);
    expect(readSnapshot(DEMO_TODAY)).toBeNull(); // not yet

    vi.advanceTimersByTime(1);
    expect(readSnapshot(DEMO_TODAY)).not.toBeNull(); // now
  });
});

describe('applyCrossTabStorageEvent', () => {
  it('ignores an event for a different localStorage key', () => {
    seedAllStores();
    const before = useBookingStore.getState().bookings;
    applyCrossTabStorageEvent({ key: 'some-unrelated-key', newValue: JSON.stringify(makeValidSnapshot()) }, DEMO_TODAY);
    expect(useBookingStore.getState().bookings).toBe(before);
  });

  it('ignores a removeItem event (newValue null) rather than clearing this tab', () => {
    seedAllStores();
    const before = useBookingStore.getState().bookings;
    applyCrossTabStorageEvent({ key: snapshotStorageKey(DEMO_TODAY), newValue: null }, DEMO_TODAY);
    expect(useBookingStore.getState().bookings).toBe(before);
  });

  it('ignores malformed JSON without throwing', () => {
    seedAllStores();
    expect(() =>
      applyCrossTabStorageEvent({ key: snapshotStorageKey(DEMO_TODAY), newValue: '{not json' }, DEMO_TODAY),
    ).not.toThrow();
  });

  it('applies a valid same-day snapshot to every store it covers', () => {
    clearAllStores();
    const incoming = makeValidSnapshot({
      bookings: [makeBooking({ id: 'bkg-from-other-tab' })],
      customers: [makeCustomer({ id: 'cus-from-other-tab' })],
    });

    applyCrossTabStorageEvent({ key: snapshotStorageKey(DEMO_TODAY), newValue: JSON.stringify(incoming) }, DEMO_TODAY);

    expect(useBookingStore.getState().bookings).toEqual(incoming.bookings);
    expect(useCustomerStore.getState().customers).toEqual(incoming.customers);
    expect(useSessionStore.getState().sessions).toEqual(incoming.sessions);
    expect(useCatalogStore.getState().membershipPlans).toEqual(incoming.membershipPlans);
    expect(useSettingsStore.getState().settings).toEqual(incoming.settings);
  });
});
