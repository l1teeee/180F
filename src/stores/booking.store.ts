// docs/08-STATE-MANAGEMENT.md section 1 (state shape), section 8.1-8.3 (mutation protocol),
// section 8.5 (the three cross-store edges). Every mutating action is funnelled through
// serialize() and re-validates against the live ledger at commit time (ADR-017): that is
// what makes booked <= capacity a structural property instead of a race the demo usually
// wins, not defensive padding on top of serialize() alone.
import { create } from 'zustand';
import type { Booking, NewBookingInput, PublicBookingInput } from '@/domain/types';
import {
  selectBookingEligibility,
  selectCancellationEligibility,
  selectPromotionEligibility,
  type BookingRejectionReason,
  type CancellationRejectionReason,
  type PromotionRejectionReason,
} from '@/domain/selectors';
import { bookingRepository } from '@/services/repositories';
import { serialize } from './mutation-queue';
import { useCustomerStore } from './customer.store';
import { scheduleSnapshotWrite } from './demo-persistence';
import { useDemoRuntimeStore } from './demo-runtime.store';
import { useNotificationStore } from './notification.store';
import { useSessionStore } from './session.store';
import { useSettingsStore } from './settings.store';

export type BookingActionResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: BookingRejectionReason; message: string };

export type CancelActionResult = { ok: true } | { ok: false; reason: CancellationRejectionReason; message: string };

export type PromoteActionResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: PromotionRejectionReason; message: string };

interface BookingState {
  bookings: Booking[];
  mutation: 'idle' | 'pending';
  setBookings: (bookings: Booking[]) => void;
  createBooking: (input: NewBookingInput) => Promise<BookingActionResult>;
  createPublicBooking: (input: PublicBookingInput) => Promise<BookingActionResult>;
  cancelBooking: (bookingId: string, options?: { override?: boolean }) => Promise<CancelActionResult>;
  checkIn: (bookingId: string) => Promise<void>;
  promoteFromWaitlist: (bookingId: string) => Promise<PromoteActionResult>;
}

// Every mutating action needs the demo clock; a mutation attempted before hydration finishes
// is a programming error (no UI can reach a mutation control before status === 'ready'), so
// this fails loudly rather than silently falling back to a real-time value ADR-018 forbids.
function requireDemoNow(): string {
  const { demoNow } = useDemoRuntimeStore.getState();
  if (!demoNow) throw new Error('Booking mutation attempted before the demo clock was ready.');
  return demoNow;
}

function requireSettings() {
  const { settings } = useSettingsStore.getState();
  if (!settings) throw new Error('Booking mutation attempted before settings were hydrated.');
  return settings;
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  bookings: [],
  mutation: 'idle',

  setBookings: (bookings) => set({ bookings }),

  createBooking: (input) =>
    serialize(async (): Promise<BookingActionResult> => {
      set({ mutation: 'pending' });
      try {
        const session = useSessionStore.getState().sessions.find((s) => s.id === input.sessionId);
        if (!session) {
          return { ok: false, reason: 'session_not_found', message: 'This session could not be found.' };
        }
        const customer = useCustomerStore.getState().customers.find((c) => c.id === input.customerId);
        if (!customer) {
          // docs/04 invariant 1: every Booking.customerId resolves to a Customer. An internal
          // caller passing an unknown id is a bug, not a user-facing rejection.
          throw new Error(`createBooking: unknown customerId "${input.customerId}"`);
        }

        const settings = requireSettings();
        const demoNow = requireDemoNow();
        const requestedStatus = input.status ?? 'confirmed';

        const preCheck = selectBookingEligibility({
          session,
          customer,
          bookings: get().bookings,
          sessions: useSessionStore.getState().sessions,
          settings,
          demoNow,
          requestedStatus,
        });
        if (!preCheck.allowed) {
          return { ok: false, reason: preCheck.reason, message: preCheck.message };
        }

        const created = await bookingRepository.create(input, demoNow);

        let result: BookingActionResult = {
          ok: false,
          reason: 'session_full',
          message: 'The spot was taken while your request was processing.',
        };
        set((state) => {
          const freshSessions = useSessionStore.getState().sessions;
          const freshSession = freshSessions.find((s) => s.id === input.sessionId);
          if (!freshSession) {
            result = { ok: false, reason: 'session_not_found', message: 'This session could not be found.' };
            return state;
          }
          const freshCheck = selectBookingEligibility({
            session: freshSession,
            customer,
            bookings: state.bookings,
            sessions: freshSessions,
            settings,
            demoNow,
            requestedStatus,
          });
          if (!freshCheck.allowed) {
            result = { ok: false, reason: freshCheck.reason, message: freshCheck.message };
            return state;
          }
          result = { ok: true, booking: created };
          return { bookings: [...state.bookings, created] };
        });

        if (result.ok) {
          useNotificationStore.getState().push({
            type: 'booking_created',
            title: 'New booking',
            description: `${customer.name} booked a spot.`,
            createdAt: demoNow,
          });
          scheduleSnapshotWrite();
        }
        return result;
      } finally {
        set({ mutation: 'idle' });
      }
    }),

  createPublicBooking: (input) =>
    serialize(async (): Promise<BookingActionResult> => {
      // Owns the pending flag from its first line so a second submit is rejected before any
      // state changes (docs/08 section 8.2).
      set({ mutation: 'pending' });
      try {
        const session = useSessionStore.getState().sessions.find((s) => s.id === input.sessionId);
        if (!session) {
          return { ok: false, reason: 'session_not_found', message: 'This class could not be found.' };
        }

        const demoNow = requireDemoNow();
        const settings = requireSettings();

        // Resolves an existing customer by email, or asks the repository to build a new
        // (not yet committed) one - deliberately not committed yet, so a booking this action
        // goes on to reject never leaves an orphan customer in the store (docs/08 section 8.2).
        const customer = await useCustomerStore.getState().upsertByEmail(
          { name: input.name, email: input.email, phone: input.phone },
          demoNow.slice(0, 10),
        );

        // The public wizard never offers a waitlist choice on a full session (master plan
        // section 37 / ADR-008 consequences: full sessions are disabled in public booking) -
        // it always requests 'confirmed' and simply rejects if the spot is gone.
        const requestedStatus = 'confirmed' as const;

        const preCheck = selectBookingEligibility({
          session,
          customer,
          bookings: get().bookings,
          sessions: useSessionStore.getState().sessions,
          settings,
          demoNow,
          requestedStatus,
        });
        if (!preCheck.allowed) {
          return { ok: false, reason: preCheck.reason, message: preCheck.message };
        }

        const created = await bookingRepository.create(
          { customerId: customer.id, sessionId: session.id, source: 'website', status: requestedStatus },
          demoNow,
        );

        let result: BookingActionResult = {
          ok: false,
          reason: 'session_full',
          message: 'The spot was taken while your request was processing.',
        };
        set((state) => {
          const freshSessions = useSessionStore.getState().sessions;
          const freshSession = freshSessions.find((s) => s.id === input.sessionId);
          if (!freshSession) {
            result = { ok: false, reason: 'session_not_found', message: 'This class could not be found.' };
            return state;
          }
          const freshCheck = selectBookingEligibility({
            session: freshSession,
            customer,
            bookings: state.bookings,
            sessions: freshSessions,
            settings,
            demoNow,
            requestedStatus,
          });
          if (!freshCheck.allowed) {
            result = { ok: false, reason: freshCheck.reason, message: freshCheck.message };
            return state;
          }
          result = { ok: true, booking: created };
          return { bookings: [...state.bookings, created] };
        });

        // Both commits below happen only on success, synchronously and with no await between
        // them, so nothing else queued behind this serialized action can observe a booking
        // without its customer or vice versa (docs/08 section 8.5).
        if (result.ok) {
          useCustomerStore.getState().commitCustomer(customer);
          useNotificationStore.getState().push({
            type: 'booking_created',
            title: 'New booking',
            description: `${customer.name} booked a spot.`,
            createdAt: demoNow,
          });
          scheduleSnapshotWrite();
        }
        return result;
      } finally {
        set({ mutation: 'idle' });
      }
    }),

  cancelBooking: (bookingId, options) =>
    serialize(async (): Promise<CancelActionResult> => {
      set({ mutation: 'pending' });
      try {
        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) {
          // Every id this action receives was read from this same store's state, so an
          // unresolvable id is a bug, not a user-facing rejection.
          throw new Error(`cancelBooking: unknown booking id "${bookingId}"`);
        }
        const session = useSessionStore.getState().sessions.find((s) => s.id === booking.sessionId);
        if (!session) {
          throw new Error(`cancelBooking: booking "${bookingId}" references an unknown session "${booking.sessionId}"`);
        }
        const settings = requireSettings();
        const demoNow = requireDemoNow();

        const preCheck = selectCancellationEligibility({
          booking,
          session,
          settings,
          demoNow,
          override: options?.override,
        });
        if (!preCheck.allowed) {
          return { ok: false, reason: preCheck.reason, message: preCheck.message };
        }

        await bookingRepository.cancel(bookingId);

        let result: CancelActionResult = {
          ok: false,
          reason: 'already_cancelled',
          message: 'This booking was already cancelled.',
        };
        set((state) => {
          const current = state.bookings.find((b) => b.id === bookingId);
          if (!current || current.status === 'cancelled') {
            result = { ok: false, reason: 'already_cancelled', message: 'This booking was already cancelled.' };
            return state;
          }
          result = { ok: true };
          return {
            bookings: state.bookings.map((b): Booking =>
              b.id === bookingId ? { ...b, status: 'cancelled', cancelledAt: demoNow } : b,
            ),
          };
        });

        if (result.ok) {
          const customer = useCustomerStore.getState().customers.find((c) => c.id === booking.customerId);
          useNotificationStore.getState().push({
            type: 'booking_cancelled',
            title: 'Booking cancelled',
            description: customer ? `${customer.name} cancelled a booking.` : 'A booking was cancelled.',
            createdAt: demoNow,
          });
          scheduleSnapshotWrite();
        }
        return result;
      } finally {
        set({ mutation: 'idle' });
      }
    }),

  checkIn: (bookingId) =>
    serialize(async (): Promise<void> => {
      set({ mutation: 'pending' });
      try {
        const demoNow = requireDemoNow();
        // No-ops (rather than throwing) for an id that is not currently 'confirmed' - unlike
        // an unresolvable id elsewhere in this store, checking in a booking that is no longer
        // eligible is a reachable double-click, not a broken invariant.
        set((state) => ({
          bookings: state.bookings.map((b): Booking =>
            b.id === bookingId && b.status === 'confirmed' ? { ...b, checkedInAt: demoNow } : b,
          ),
        }));
        scheduleSnapshotWrite();
      } finally {
        set({ mutation: 'idle' });
      }
    }),

  promoteFromWaitlist: (bookingId) =>
    serialize(async (): Promise<PromoteActionResult> => {
      set({ mutation: 'pending' });
      try {
        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) throw new Error(`promoteFromWaitlist: unknown booking id "${bookingId}"`);
        const session = useSessionStore.getState().sessions.find((s) => s.id === booking.sessionId);
        if (!session) {
          throw new Error(`promoteFromWaitlist: booking "${bookingId}" references an unknown session`);
        }
        const customer = useCustomerStore.getState().customers.find((c) => c.id === booking.customerId);
        if (!customer) {
          throw new Error(`promoteFromWaitlist: booking "${bookingId}" references an unknown customer "${booking.customerId}"`);
        }

        const settings = requireSettings();
        const demoNow = requireDemoNow();

        // ADR-024 point 3: promotion must satisfy the same conditions as creating a confirmed
        // booking (session exists, not cancelled, not started, a free seat, no other active
        // booking for this customer/session, within the daily limit) - selectPromotionEligibility
        // routes through the exact same selectBookingEligibility the create path uses, so the two
        // rule sets cannot drift apart. Cheap pre-check before touching state, mirroring
        // createBooking's own two-phase check below.
        const preCheck = selectPromotionEligibility({
          bookingId,
          bookingStatus: booking.status,
          session,
          customer,
          bookings: get().bookings,
          sessions: useSessionStore.getState().sessions,
          settings,
          demoNow,
        });
        if (!preCheck.allowed) {
          return { ok: false, reason: preCheck.reason, message: preCheck.message };
        }

        let result: PromoteActionResult = {
          ok: false,
          reason: 'session_full',
          message: 'The spot was taken while your request was processing.',
        };
        set((state) => {
          const current = state.bookings.find((b) => b.id === bookingId);
          if (!current) {
            result = { ok: false, reason: 'not_waitlisted', message: 'This booking is not on the waitlist.' };
            return state;
          }
          const freshSessions = useSessionStore.getState().sessions;
          const freshSession = freshSessions.find((s) => s.id === booking.sessionId);
          if (!freshSession) {
            result = { ok: false, reason: 'session_not_found', message: 'This session could not be found.' };
            return state;
          }
          const freshCheck = selectPromotionEligibility({
            bookingId,
            bookingStatus: current.status,
            session: freshSession,
            customer,
            bookings: state.bookings,
            sessions: freshSessions,
            settings,
            demoNow,
          });
          if (!freshCheck.allowed) {
            result = { ok: false, reason: freshCheck.reason, message: freshCheck.message };
            return state;
          }
          const promoted: Booking = { ...current, status: 'confirmed' };
          result = { ok: true, booking: promoted };
          return { bookings: state.bookings.map((b) => (b.id === bookingId ? promoted : b)) };
        });
        if (result.ok) scheduleSnapshotWrite();
        return result;
      } finally {
        set({ mutation: 'idle' });
      }
    }),
}));
