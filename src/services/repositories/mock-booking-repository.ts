import type { Booking, ISODateTime, NewBookingInput } from '@/domain/types';
import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { BookingRepository } from './types';

// Runtime-created bookings use `bkg-live-<n>` (docs/04-DOMAIN-MODEL.md section 6). The sequence
// number is kept in localStorage, not a plain module-level counter: the strongest way to present
// this demo (ADR-022) runs the admin dialog and the public flow in two separate browser tabs,
// each loading its own copy of this module. A private in-memory counter starts at 0 in every
// tab, so each tab's first booking mints the same `bkg-live-1`; once ADR-022's cross-tab sync
// merges both tabs' bookings into one array, React renders two rows sharing that key. Reading and
// writing one shared sequence in localStorage - the same mechanism ADR-022 already uses to keep
// the ledger itself in sync - gives every entry point, in every tab, a single source of ids
// instead of one counter each. The number itself carries no meaning beyond uniqueness, so it is
// never reset: a new day or a mid-day "Reset demo data" both just resume from a higher number,
// never risk two bookings sharing an id.
const LIVE_BOOKING_SEQUENCE_KEY = '180f.demo.v1.liveBookingSeq';

let fallbackCounter = 0;

function nextLiveBookingId(): number {
  try {
    const stored = Number(localStorage.getItem(LIVE_BOOKING_SEQUENCE_KEY));
    const next = (Number.isFinite(stored) && stored > 0 ? stored : 0) + 1;
    localStorage.setItem(LIVE_BOOKING_SEQUENCE_KEY, String(next));
    return next;
  } catch {
    // Storage unavailable (private mode, quota, a non-browser test context): fall back to a
    // counter that is at least unique within this module instance, same fail-soft posture as
    // demo-persistence.ts's own localStorage access.
    fallbackCounter += 1;
    return fallbackCounter;
  }
}

export const mockBookingRepository: BookingRepository = {
  async list() {
    await simulateLatency('booking-repository:list');
    return getLastLoadedSnapshot().bookings;
  },

  async create(input: NewBookingInput, createdAt: ISODateTime): Promise<Booking> {
    await simulateLatency(`booking-repository:create:${input.customerId}:${input.sessionId}`);
    return {
      id: `bkg-live-${nextLiveBookingId()}`,
      customerId: input.customerId,
      sessionId: input.sessionId,
      status: input.status ?? 'confirmed',
      source: input.source,
      createdAt,
      checkedInAt: null,
      cancelledAt: null,
    };
  },

  async cancel(bookingId: string): Promise<void> {
    await simulateLatency(`booking-repository:cancel:${bookingId}`);
    // No-op beyond the simulated round trip: the booking store owns the live ledger
    // (ADR-009) and applies the status change itself, inside its own commit-time recheck.
  },
};
