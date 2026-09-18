// ADR-022, extending docs/08-STATE-MANAGEMENT.md section 8. One localStorage snapshot per
// demo day holding every user-changeable slice (bookings, customers, sessions, membership
// plans, automations, notifications, settings), written after each committed mutation and
// restored on hydration - so a full navigation or a second tab never loses a presenter's
// changes. Class types, instructors and demoNow stay out of the snapshot: ADR-022 keeps them
// "static and always regenerated" from the deterministic seed, never from storage.
import type {
  Automation,
  Booking,
  ClassSession,
  Customer,
  ISODate,
  MembershipPlan,
  Notification,
  StudioSettings,
} from '@/domain/types';
import { useAutomationStore } from './automation.store';
import { useBookingStore } from './booking.store';
import { useCatalogStore } from './catalog.store';
import { useCustomerStore } from './customer.store';
import { useDemoRuntimeStore } from './demo-runtime.store';
import { useNotificationStore } from './notification.store';
import { useSessionStore } from './session.store';
import { useSettingsStore } from './settings.store';

const SNAPSHOT_KEY_PREFIX = '180f.demo.v1.';
const SNAPSHOT_VERSION = 1;
const WRITE_DEBOUNCE_MS = 250;

export function snapshotStorageKey(demoToday: ISODate): string {
  return `${SNAPSHOT_KEY_PREFIX}${demoToday}`;
}

export interface DemoSnapshot {
  version: typeof SNAPSHOT_VERSION;
  demoToday: ISODate;
  bookings: Booking[];
  customers: Customer[];
  sessions: ClassSession[];
  membershipPlans: MembershipPlan[];
  automations: Automation[];
  notifications: Notification[];
  settings: StudioSettings;
}

function serializeSnapshot(demoToday: ISODate): DemoSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    demoToday,
    bookings: useBookingStore.getState().bookings,
    customers: useCustomerStore.getState().customers,
    sessions: useSessionStore.getState().sessions,
    membershipPlans: useCatalogStore.getState().membershipPlans,
    automations: useAutomationStore.getState().automations,
    notifications: useNotificationStore.getState().notifications,
    // scheduleSnapshotWrite only ever fires after a mutation, and every mutating action already
    // requires settings to be hydrated (requireSettings() in booking.store.ts) - so by the time
    // this runs, settings is never null.
    settings: useSettingsStore.getState().settings as StudioSettings,
  };
}

// A snapshot is untrusted input the moment it comes back out of localStorage: a different app
// version, a hand-edited value, a stale day or a truncated write must all fall back to the seed
// rather than feed a malformed shape into the stores (ADR-022 "validate before trusting").
function isValidSnapshot(value: unknown, demoToday: ISODate): value is DemoSnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== SNAPSHOT_VERSION) return false;
  if (candidate.demoToday !== demoToday) return false;
  if (!Array.isArray(candidate.bookings)) return false;
  if (!Array.isArray(candidate.customers)) return false;
  if (!Array.isArray(candidate.sessions)) return false;
  if (!Array.isArray(candidate.membershipPlans)) return false;
  if (!Array.isArray(candidate.automations)) return false;
  if (!Array.isArray(candidate.notifications)) return false;
  if (!candidate.settings || typeof candidate.settings !== 'object') return false;
  const settings = candidate.settings as Record<string, unknown>;
  return Boolean(settings.general && settings.booking && settings.notifications && settings.branding);
}

/** Never throws: a parse error, a missing key or a failed validation all just mean "no snapshot". */
export function readSnapshot(demoToday: ISODate): DemoSnapshot | null {
  try {
    const raw = localStorage.getItem(snapshotStorageKey(demoToday));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSnapshot(parsed, demoToday) ? parsed : null;
  } catch {
    return null; // corrupt JSON, or storage unavailable (e.g. Safari private mode)
  }
}

/** Never throws: a quota error or unavailable storage just means this change will not survive a reload. */
export function writeSnapshot(demoToday: ISODate): void {
  try {
    localStorage.setItem(snapshotStorageKey(demoToday), JSON.stringify(serializeSnapshot(demoToday)));
  } catch {
    // Not worth crashing the presenter's session over.
  }
}

export function clearSnapshot(demoToday: ISODate): void {
  try {
    localStorage.removeItem(snapshotStorageKey(demoToday));
  } catch {
    // see writeSnapshot
  }
}

export function applySnapshot(snapshot: DemoSnapshot): void {
  useBookingStore.getState().setBookings(snapshot.bookings);
  useCustomerStore.getState().setCustomers(snapshot.customers);
  useSessionStore.getState().setSessions(snapshot.sessions);
  useCatalogStore.getState().setMembershipPlans(snapshot.membershipPlans);
  useAutomationStore.getState().setAutomations(snapshot.automations);
  useNotificationStore.getState().setNotifications(snapshot.notifications);
  useSettingsStore.getState().setSettings(snapshot.settings);
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced so a burst of commits writes once (ADR-022, ~250ms). No-ops before hydration has a
 * demoToday to key the snapshot by - no mutating action can be reached from the UI that early.
 */
export function scheduleSnapshotWrite(): void {
  const { demoToday } = useDemoRuntimeStore.getState();
  if (!demoToday) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writeSnapshot(demoToday);
  }, WRITE_DEBOUNCE_MS);
}

/**
 * Guards the debounce above against the exact race that makes it dangerous: a mutation commits,
 * scheduleSnapshotWrite() starts its ~250ms timer, and the presenter navigates (or switches
 * tabs) before that timer fires - a plain setTimeout dies with the page, silently dropping the
 * write. `pagehide` covers a real navigation/close; `visibilitychange` also covers switching
 * away without navigating. Both just flush the pending write immediately; a tab with nothing
 * pending pays nothing.
 */
function flushPendingSnapshotWrite(): void {
  if (!writeTimer) return;
  const { demoToday } = useDemoRuntimeStore.getState();
  clearTimeout(writeTimer);
  writeTimer = null;
  if (demoToday) writeSnapshot(demoToday);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingSnapshotWrite);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingSnapshotWrite();
  });
}

/**
 * The `storage` event handler's logic, factored out from its DOM registration below so it is
 * directly unit-testable with a plain object instead of a real StorageEvent/window listener.
 * Only ever fires in OTHER tabs (the browser never raises `storage` in the tab that made the
 * change), which is exactly "other tabs rehydrate" (ADR-022) - the originating tab already has
 * the state it just committed.
 */
export function applyCrossTabStorageEvent(event: Pick<StorageEvent, 'key' | 'newValue'>, demoToday: ISODate | null): void {
  if (!demoToday || event.key !== snapshotStorageKey(demoToday) || !event.newValue) return;
  try {
    const parsed: unknown = JSON.parse(event.newValue);
    if (isValidSnapshot(parsed, demoToday)) applySnapshot(parsed);
  } catch {
    // A malformed cross-tab write is never trusted, same as a malformed snapshot on load.
  }
}

export function registerCrossTabSync(getDemoToday: () => ISODate | null): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('storage', (event) => applyCrossTabStorageEvent(event, getDemoToday()));
}
