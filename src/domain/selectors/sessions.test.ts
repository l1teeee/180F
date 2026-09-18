// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession } from '@/domain/types';
import { selectAlmostFullSessions, selectSessionOccupancy, selectUpcomingSessions } from './sessions';
import { buildDemoDataset } from '@/data/seed';

const DEMO_TODAY = '2026-09-17';

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-test',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: DEMO_TODAY,
    startTime: '06:00',
    endTime: '06:50',
    capacity: 20,
    room: 'Studio A',
    status: 'scheduled',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-test',
    customerId: 'cus-0001',
    sessionId: 'ses-test',
    status: 'confirmed',
    source: 'website',
    createdAt: '2026-09-10T09:00:00.000-05:00',
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

describe('selectSessionOccupancy', () => {
  it('booked = count(confirmed) + count(pending); cancelled and waitlist are excluded', () => {
    const session = makeSession({ capacity: 10 });
    const bookings = [
      makeBooking({ id: 'b1', status: 'confirmed' }),
      makeBooking({ id: 'b2', status: 'pending' }),
      makeBooking({ id: 'b3', status: 'cancelled' }),
      makeBooking({ id: 'b4', status: 'waitlist' }),
    ];
    const result = selectSessionOccupancy(session, bookings);
    expect(result.booked).toBe(2);
    expect(result.waitlistCount).toBe(1);
  });

  it('available = max(0, capacity - booked)', () => {
    const session = makeSession({ capacity: 3 });
    const bookings = [1, 2, 3, 4].map((n) =>
      makeBooking({ id: `b${n}`, customerId: `cus-000${n}`, status: 'confirmed' }),
    );
    const result = selectSessionOccupancy(session, bookings);
    expect(result.booked).toBe(4);
    expect(result.available).toBe(0); // clamped, never negative
  });

  it('is full when available <= 0, regardless of the exact occupancyRate rounding', () => {
    const session = makeSession({ capacity: 5 });
    const bookings = [1, 2, 3, 4, 5].map((n) =>
      makeBooking({ id: `b${n}`, customerId: `cus-000${n}`, status: 'confirmed' }),
    );
    const result = selectSessionOccupancy(session, bookings);
    expect(result.available).toBe(0);
    expect(result.occupancyState).toBe('full');
  });

  it('is almost_full at exactly the 0.85 boundary and not full', () => {
    const session = makeSession({ capacity: 20 });
    const bookings = Array.from({ length: 17 }, (_, i) =>
      makeBooking({ id: `b${i}`, customerId: `cus-${String(i).padStart(4, '0')}`, status: 'confirmed' }),
    ); // 17 / 20 = 0.85 exactly
    const result = selectSessionOccupancy(session, bookings);
    expect(result.occupancyRate).toBeCloseTo(0.85, 10);
    expect(result.occupancyState).toBe('almost_full');
    expect(result.overbooked).toBe(false);
  });

  it('is available one booking below the 0.85 boundary', () => {
    const session = makeSession({ capacity: 20 });
    const bookings = Array.from({ length: 16 }, (_, i) =>
      makeBooking({ id: `b${i}`, customerId: `cus-${String(i).padStart(4, '0')}`, status: 'confirmed' }),
    ); // 16 / 20 = 0.80
    const result = selectSessionOccupancy(session, bookings);
    expect(result.occupancyState).toBe('available');
    expect(result.overbooked).toBe(false);
  });

  it('clamps occupancyRate to 1 and flags overbooked when capacity is shrunk below the booking count', () => {
    // Reproduces the Edit-class-action path (master plan 22): a session that had 2 confirmed
    // bookings has its capacity edited down to 1.
    const session = makeSession({ capacity: 1 });
    const bookings = [
      makeBooking({ id: 'b1', customerId: 'cus-0001', status: 'confirmed' }),
      makeBooking({ id: 'b2', customerId: 'cus-0002', status: 'confirmed' }),
    ];
    const result = selectSessionOccupancy(session, bookings);
    expect(result.booked).toBe(2); // the ledger stays raw - never hidden or clamped
    expect(result.available).toBe(0);
    expect(result.occupancyRate).toBe(1); // clamped for display, never > 1 (was 2 pre-fix)
    expect(result.occupancyState).toBe('full');
    expect(result.overbooked).toBe(true);
  });

  it('handles zero capacity: not overbooked with no bookings, overbooked once any exist', () => {
    const emptySession = makeSession({ capacity: 0 });
    const empty = selectSessionOccupancy(emptySession, []);
    expect(empty.booked).toBe(0);
    expect(empty.available).toBe(0);
    expect(empty.occupancyRate).toBe(0);
    expect(empty.occupancyState).toBe('full'); // 0 available spots, trivially full
    expect(empty.overbooked).toBe(false);

    const bookedSession = makeSession({ capacity: 0 });
    const bookings = [makeBooking({ id: 'b1', customerId: 'cus-0001', status: 'confirmed' })];
    const result = selectSessionOccupancy(bookedSession, bookings);
    expect(result.booked).toBe(1);
    expect(result.available).toBe(0);
    expect(result.occupancyRate).toBe(1); // clamped, division by zero avoided
    expect(result.occupancyState).toBe('full');
    expect(result.overbooked).toBe(true);
  });
});

describe('selectUpcomingSessions / selectAlmostFullSessions over the real dataset', () => {
  const dataset = buildDemoDataset(DEMO_TODAY);

  it('selectUpcomingSessions returns only scheduled sessions on/after demoToday, soonest first', () => {
    const upcoming = selectUpcomingSessions(
      dataset.sessions,
      dataset.bookings,
      dataset.classTypes,
      dataset.instructors,
      DEMO_TODAY,
      4,
    );
    expect(upcoming).toHaveLength(4);
    for (const card of upcoming) {
      expect(card.status).toBe('scheduled');
      expect(card.date >= DEMO_TODAY).toBe(true);
    }
    for (let i = 1; i < upcoming.length; i++) {
      const prevKey = `${upcoming[i - 1].date}T${upcoming[i - 1].startTime}`;
      const key = `${upcoming[i].date}T${upcoming[i].startTime}`;
      expect(prevKey <= key).toBe(true);
    }
  });

  it('selectAlmostFullSessions returns only sessions in the almost_full state', () => {
    const almostFull = selectAlmostFullSessions(dataset.sessions, dataset.bookings, dataset.classTypes, dataset.instructors);
    expect(almostFull.length).toBeGreaterThan(0);
    for (const card of almostFull) {
      expect(card.occupancyState).toBe('almost_full');
    }
  });
});
