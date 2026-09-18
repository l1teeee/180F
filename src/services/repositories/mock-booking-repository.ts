import type { Booking, ISODateTime, NewBookingInput } from '@/domain/types';
import { createLiveIdSequence } from './live-id-sequence';
import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { BookingRepository } from './types';

// Runtime-created bookings use `bkg-live-<n>` (docs/04-DOMAIN-MODEL.md section 6). See
// live-id-sequence.ts for why the sequence lives in localStorage rather than a plain
// module-level counter.
const nextLiveBookingId = createLiveIdSequence('180f.demo.v1.liveBookingSeq');

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
