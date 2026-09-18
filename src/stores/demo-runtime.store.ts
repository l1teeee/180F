// docs/08-STATE-MANAGEMENT.md sections 1 and 8.4 (section 8.4 supersedes the plain sketch in
// section 3: it is the version with error recovery, and is what is implemented here). The
// hydration gate behind ADR-005: no data-derived DOM exists during SSR, so no mismatch is
// possible, and the `status !== 'idle'` guard on entry makes React 19 StrictMode's doubled
// mount effect harmless (a second call sees 'loading' and returns immediately).
import { create } from 'zustand';
import type { ISODate, ISODateTime } from '@/domain/types';
import { loadDemoDataset } from '@/services/repositories';
import { useAutomationStore } from './automation.store';
import { useBookingStore } from './booking.store';
import { useCatalogStore } from './catalog.store';
import { useCustomerStore } from './customer.store';
import { useInstructorStore } from './instructor.store';
import { useNotificationStore } from './notification.store';
import { useSessionStore } from './session.store';
import { useSettingsStore } from './settings.store';

export type DemoRuntimeStatus = 'idle' | 'loading' | 'ready' | 'error';

interface DemoRuntimeState {
  status: DemoRuntimeStatus;
  demoToday: ISODate | null;
  demoNow: ISODateTime | null;
  error: string | null;
  hydrateDemo: () => Promise<void>;
  retryHydration: () => Promise<void>;
  resetDemo: () => void;
}

// ADR-018: `new Date()` appears only here (to resolve the calendar date) and inside
// lib/dates.ts for formatting - nowhere else in the app reads the real wall clock.
function todayISO(): ISODate {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useDemoRuntimeStore = create<DemoRuntimeState>()((set, get) => ({
  status: 'idle',
  demoToday: null,
  demoNow: null,
  error: null,

  hydrateDemo: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return; // 'error' may retry
    set({ status: 'loading', error: null });
    try {
      const dataset = await loadDemoDataset(todayISO());
      useCatalogStore.getState().setCatalog(dataset);
      useInstructorStore.getState().setInstructors(dataset.instructors);
      useCustomerStore.getState().setCustomers(dataset.customers);
      useSessionStore.getState().setSessions(dataset.sessions);
      useBookingStore.getState().setBookings(dataset.bookings);
      useAutomationStore.getState().setAutomations(dataset.automations);
      useNotificationStore.getState().setNotifications(dataset.notifications);
      useSettingsStore.getState().setSettings(dataset.settings);
      set({ status: 'ready', demoToday: dataset.demoToday, demoNow: dataset.demoNow, error: null });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  },

  // hydrateDemo()'s own guard already lets an 'error' status through to retry, so this is a
  // thin, explicitly-named alias for the "Try again" control (docs/08 section 8.4) rather
  // than a second, divergent implementation of the same load.
  retryHydration: () => get().hydrateDemo(),

  resetDemo: () => set({ status: 'idle', demoToday: null, demoNow: null, error: null }),
}));
