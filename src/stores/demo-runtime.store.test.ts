// docs/08-STATE-MANAGEMENT.md section 8.4: the `status !== 'idle'` guard on entry is what
// makes React 19 StrictMode's doubled mount effect harmless. Mocks the repository (rather
// than letting it run against the real generator) so the assertion is direct: the dataset is
// only ever loaded once, not merely that the final state happens to look consistent.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DemoDataset } from '@/domain/types';

const { loadDemoDatasetMock } = vi.hoisted(() => ({ loadDemoDatasetMock: vi.fn() }));

vi.mock('@/services/repositories', () => ({
  loadDemoDataset: loadDemoDatasetMock,
}));

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

beforeEach(() => {
  loadDemoDatasetMock.mockClear();
  loadDemoDatasetMock.mockImplementation(async (demoToday: string) => makeFakeDataset(demoToday));
  useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });
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
