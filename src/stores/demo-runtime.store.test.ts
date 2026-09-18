// docs/08-STATE-MANAGEMENT.md section 8.4: the `status !== 'idle'` guard on entry is what
// makes React 19 StrictMode's doubled mount effect harmless. Mocks the repository (rather
// than letting it run against the real generator) so the assertion is direct: the dataset is
// only ever loaded once, not merely that the final state happens to look consistent.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Booking, DemoDataset } from '@/domain/types';

const { loadDemoDatasetMock } = vi.hoisted(() => ({ loadDemoDatasetMock: vi.fn() }));

vi.mock('@/services/repositories', () => ({
  loadDemoDataset: loadDemoDatasetMock,
}));

import { useBookingStore } from './booking.store';
import { useCatalogStore } from './catalog.store';
import { readSnapshot, snapshotStorageKey, writeSnapshot } from './demo-persistence';
import { useDemoRuntimeStore } from './demo-runtime.store';

function makeFakeDataset(demoToday: string): DemoDataset {
  return {
    organization: { id: 'org-test', name: 'Test Studio', logo: null, timezone: 'America/Bogota', address: '', phone: '', email: '' },
    classTypes: [],
    instructors: [],
    membershipPlans: [],
    customers: [],
    sessions: [],
    bookings: [],
    automations: [],
    notifications: [],
    settings: {
      general: { studioName: 'Test Studio', email: '', phone: '', address: '', timezone: 'America/Bogota' },
      booking: { cancellationWindowHours: 12, maxReservationsPerDay: 2, waitlistEnabled: true, advanceBookingDays: 14 },
      notifications: { whatsappConfirmations: true, emailConfirmations: false, reminderHoursBefore: 24 },
      branding: { logo: null, primaryColor: '#7869D4', accentColor: '#F5D889' },
    },
    demoToday,
    demoNow: `${demoToday}T09:00:00.000-05:00`,
  };
}

function makeLiveBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-live-1',
    customerId: 'cus-live-1',
    sessionId: 'ses-live-1',
    status: 'confirmed',
    source: 'website',
    createdAt: '2026-09-17T09:00:00.000-05:00',
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  loadDemoDatasetMock.mockClear();
  loadDemoDatasetMock.mockImplementation(async (demoToday: string) => makeFakeDataset(demoToday));
  useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });
  useBookingStore.setState({ bookings: [], mutation: 'idle' });
});

describe('hydrateDemo', () => {
  it('loads the dataset only once when called twice concurrently (StrictMode double-effect)', async () => {
    const first = useDemoRuntimeStore.getState().hydrateDemo();
    const second = useDemoRuntimeStore.getState().hydrateDemo();

    await Promise.all([first, second]);

    expect(loadDemoDatasetMock).toHaveBeenCalledTimes(1);
    expect(useDemoRuntimeStore.getState().status).toBe('ready');
  });

  it('is a no-op once status is already ready', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    expect(loadDemoDatasetMock).toHaveBeenCalledTimes(1);

    await useDemoRuntimeStore.getState().hydrateDemo();
    expect(loadDemoDatasetMock).toHaveBeenCalledTimes(1);
  });

  it('moves to status "error" with a message when the load rejects (docs/08 section 8.4)', async () => {
    loadDemoDatasetMock.mockRejectedValueOnce(new Error('network down'));

    await useDemoRuntimeStore.getState().hydrateDemo();

    expect(useDemoRuntimeStore.getState().status).toBe('error');
    expect(useDemoRuntimeStore.getState().error).toBe('network down');
    expect(useDemoRuntimeStore.getState().demoToday).toBeNull();
  });

  it('recovers to "ready" on retryHydration after a failed load (Codex H5)', async () => {
    loadDemoDatasetMock.mockRejectedValueOnce(new Error('network down'));
    await useDemoRuntimeStore.getState().hydrateDemo();
    expect(useDemoRuntimeStore.getState().status).toBe('error');

    await useDemoRuntimeStore.getState().retryHydration();

    expect(useDemoRuntimeStore.getState().status).toBe('ready');
    expect(useDemoRuntimeStore.getState().error).toBeNull();
    expect(useDemoRuntimeStore.getState().demoToday).not.toBeNull();
    expect(loadDemoDatasetMock).toHaveBeenCalledTimes(2);
  });
});

describe('hydrateDemo snapshot restore (ADR-022)', () => {
  it('falls back to the fresh dataset when no snapshot is stored', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    expect(useBookingStore.getState().bookings).toEqual([]); // the mock dataset's own (empty) bookings
  });

  it('restores bookings and membership plans from a valid same-day snapshot instead of the fresh seed', async () => {
    // Learn today's key the same way hydrateDemo computes it, by hydrating once first.
    await useDemoRuntimeStore.getState().hydrateDemo();
    const demoToday = useDemoRuntimeStore.getState().demoToday!;
    const dataset = makeFakeDataset(demoToday);

    const snapshot = {
      version: 1,
      demoToday,
      bookings: [makeLiveBooking()],
      customers: [],
      sessions: [],
      membershipPlans: [{ id: 'plan-live', name: 'Live Plan', monthlyPrice: 49, billingPeriod: 'monthly' as const, classLimit: null, benefits: [], accent: 'purple' as const }],
      automations: [],
      notifications: [],
      settings: dataset.settings,
    };
    localStorage.setItem(snapshotStorageKey(demoToday), JSON.stringify(snapshot));
    useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });

    await useDemoRuntimeStore.getState().hydrateDemo();

    expect(useDemoRuntimeStore.getState().status).toBe('ready');
    expect(useBookingStore.getState().bookings).toEqual(snapshot.bookings);
    expect(useCatalogStore.getState().membershipPlans).toEqual(snapshot.membershipPlans);
    // Static reference data still comes from the freshly loaded dataset, never the snapshot
    // (ADR-022: "class types and instructors are static and always regenerated").
    expect(useCatalogStore.getState().organization).toEqual({ id: dataset.organization.id, logo: dataset.organization.logo });
  });

  it('discards an invalid snapshot (wrong version) and falls back to the seed', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    const demoToday = useDemoRuntimeStore.getState().demoToday!;
    localStorage.setItem(snapshotStorageKey(demoToday), JSON.stringify({ version: 999, demoToday, bookings: [makeLiveBooking()] }));
    useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });

    await useDemoRuntimeStore.getState().hydrateDemo();

    expect(useDemoRuntimeStore.getState().status).toBe('ready');
    expect(useBookingStore.getState().bookings).toEqual([]);
  });
});

describe('resetDemoData (ADR-022)', () => {
  it('clears the stored snapshot, reseeds to the fresh dataset, and writes a snapshot matching the reseeded state', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    const demoToday = useDemoRuntimeStore.getState().demoToday!;

    // Simulate a presenter's committed change, persisted the way scheduleSnapshotWrite would.
    useBookingStore.setState({ bookings: [makeLiveBooking()], mutation: 'idle' });
    writeSnapshot(demoToday);
    expect(readSnapshot(demoToday)?.bookings).toEqual([makeLiveBooking()]);

    await useDemoRuntimeStore.getState().resetDemoData();

    expect(useDemoRuntimeStore.getState().status).toBe('ready');
    expect(useBookingStore.getState().bookings).toEqual([]); // back to the seed, not the live booking
    const freshToday = useDemoRuntimeStore.getState().demoToday!;
    expect(readSnapshot(freshToday)?.bookings).toEqual([]); // the fresh snapshot matches the reseeded state
    expect(loadDemoDatasetMock).toHaveBeenCalledTimes(2); // initial hydrate + the reset's reseed
  });
});

describe('cross-tab sync wiring (ADR-022)', () => {
  it('applies a same-day snapshot delivered as a real `storage` event, without re-seeding', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    const demoToday = useDemoRuntimeStore.getState().demoToday!;
    const dataset = makeFakeDataset(demoToday);
    loadDemoDatasetMock.mockClear();

    const incoming = {
      version: 1,
      demoToday,
      bookings: [makeLiveBooking({ id: 'bkg-from-other-tab' })],
      customers: [],
      sessions: [],
      membershipPlans: [],
      automations: [],
      notifications: [],
      settings: dataset.settings,
    };

    window.dispatchEvent(
      new StorageEvent('storage', { key: snapshotStorageKey(demoToday), newValue: JSON.stringify(incoming) }),
    );

    expect(useBookingStore.getState().bookings).toEqual(incoming.bookings);
    expect(loadDemoDatasetMock).not.toHaveBeenCalled(); // cross-tab sync applies the snapshot directly, no re-fetch
  });

  it('ignores a `storage` event for a different day', async () => {
    await useDemoRuntimeStore.getState().hydrateDemo();
    const demoToday = useDemoRuntimeStore.getState().demoToday!;
    const before = useBookingStore.getState().bookings;

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: snapshotStorageKey('1999-01-01'),
        newValue: JSON.stringify({ version: 1, demoToday: '1999-01-01', bookings: [makeLiveBooking()], customers: [], sessions: [], membershipPlans: [], automations: [], notifications: [], settings: makeFakeDataset(demoToday).settings }),
      }),
    );

    expect(useBookingStore.getState().bookings).toBe(before);
  });
});
