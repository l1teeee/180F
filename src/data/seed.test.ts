// buildDemoDataset invariants (docs/04-DOMAIN-MODEL.md section 7, docs/05-MOCK-DATA-STRATEGY.md
// section 9), determinism, and the narrative assertions from section 8 / amendment A1. Every
// invariant and narrative outcome runs for all seven weekday anchors - a single-anchor test is
// not acceptable (Codex H1): the unpatched statistical pass reproduced 3, 3, 2, 3 full sessions
// in the next 3 days for Thursday through Sunday against the original spec.
import { afterEach, describe, expect, it } from 'vitest';
import type { BookingSource, BookingStatus, DemoDataset, ISODate } from '@/domain/types';
import { addDaysISO, buildISODateTime, isWeekendISO } from '@/lib/dates';
import { buildDemoDataset } from './seed';

// One anchor per weekday, 2026-09-14 (Monday) through 2026-09-20 (Sunday).
const WEEKDAY_ANCHORS: ISODate[] = [
  '2026-09-14',
  '2026-09-15',
  '2026-09-16',
  '2026-09-17',
  '2026-09-18',
  '2026-09-19',
  '2026-09-20',
];

function countBookedBySession(dataset: DemoDataset): Map<string, number> {
  const counts = new Map<string, number>();
  for (const booking of dataset.bookings) {
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      counts.set(booking.sessionId, (counts.get(booking.sessionId) ?? 0) + 1);
    }
  }
  return counts;
}

describe.each(WEEKDAY_ANCHORS)('buildDemoDataset(%s)', (demoToday) => {
  const dataset = buildDemoDataset(demoToday);
  const customerIds = new Set(dataset.customers.map((c) => c.id));
  const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
  const booked = countBookedBySession(dataset);

  describe('entity invariants (docs/04 section 7 / docs/05 section 9)', () => {
    it('every booking.customerId resolves to a customer', () => {
      for (const booking of dataset.bookings) {
        expect(customerIds.has(booking.customerId)).toBe(true);
      }
    });

    it('every booking.sessionId resolves to a session', () => {
      for (const booking of dataset.bookings) {
        expect(sessionById.has(booking.sessionId)).toBe(true);
      }
    });

    it('booked (confirmed + pending) never exceeds capacity for any session', () => {
      for (const session of dataset.sessions) {
        expect(booked.get(session.id) ?? 0).toBeLessThanOrEqual(session.capacity);
      }
    });

    it('a customer holds at most one non-cancelled booking per session', () => {
      const seen = new Set<string>();
      for (const booking of dataset.bookings) {
        if (booking.status === 'cancelled') continue;
        const key = `${booking.customerId}|${booking.sessionId}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    it('checkedInAt is non-null only for confirmed bookings on completed sessions', () => {
      for (const booking of dataset.bookings) {
        if (booking.checkedInAt === null) continue;
        const session = sessionById.get(booking.sessionId);
        expect(session?.status).toBe('completed');
        expect(booking.status).toBe('confirmed');
      }
    });

    it('cancelledAt is non-null exactly when status is cancelled (invariant 7, Codex M5)', () => {
      for (const booking of dataset.bookings) {
        if (booking.status === 'cancelled') {
          expect(booking.cancelledAt).not.toBeNull();
        } else {
          expect(booking.cancelledAt).toBeNull();
        }
      }
    });

    it('a seeded cancelledAt falls between createdAt and the earlier of session start and demoNow', () => {
      for (const booking of dataset.bookings) {
        if (booking.status !== 'cancelled') continue;
        const session = sessionById.get(booking.sessionId)!;
        const sessionStartsAt = buildISODateTime(session.date, session.startTime);
        const upperBound = sessionStartsAt < dataset.demoNow ? sessionStartsAt : dataset.demoNow;
        expect(booking.cancelledAt! >= booking.createdAt).toBe(true);
        expect(booking.cancelledAt! <= upperBound).toBe(true);
      }
    });

    it('waitlist bookings exist only on sessions where available <= 0', () => {
      const waitlistSessionIds = new Set(
        dataset.bookings.filter((b) => b.status === 'waitlist').map((b) => b.sessionId),
      );
      for (const sessionId of waitlistSessionIds) {
        const session = sessionById.get(sessionId)!;
        const available = session.capacity - (booked.get(sessionId) ?? 0);
        expect(available).toBeLessThanOrEqual(0);
      }
    });

    it('no customer exceeds maxReservationsPerDay non-cancelled bookings on any single date', () => {
      const countByCustomerDate = new Map<string, number>();
      for (const booking of dataset.bookings) {
        if (booking.status === 'cancelled') continue;
        const session = sessionById.get(booking.sessionId);
        if (!session) continue;
        const key = `${booking.customerId}|${session.date}`;
        countByCustomerDate.set(key, (countByCustomerDate.get(key) ?? 0) + 1);
      }
      for (const count of countByCustomerDate.values()) {
        expect(count).toBeLessThanOrEqual(dataset.settings.booking.maxReservationsPerDay);
      }
    });

    it('the dataset carries demoToday and demoNow agreeing with the anchor (ADR-018)', () => {
      expect(dataset.demoToday).toBe(demoToday);
      expect(dataset.demoNow).toBe(`${demoToday}T09:00:00.000-05:00`);
    });
  });

  describe('narrative outcomes (docs/05 section 8, amendment A1)', () => {
    it('overall occupancy (confirmed+pending / capacity, cancelled session excluded) is within 0.80-0.87', () => {
      let totalBooked = 0;
      let totalCapacity = 0;
      for (const session of dataset.sessions) {
        if (session.status === 'cancelled') continue;
        totalBooked += booked.get(session.id) ?? 0;
        totalCapacity += session.capacity;
      }
      const occupancy = totalBooked / totalCapacity;
      expect(occupancy).toBeGreaterThanOrEqual(0.8);
      expect(occupancy).toBeLessThanOrEqual(0.87);
    });

    it('all four booking statuses appear at least once', () => {
      const statuses = new Set(dataset.bookings.map((b) => b.status));
      const allStatuses: BookingStatus[] = ['confirmed', 'pending', 'cancelled', 'waitlist'];
      for (const status of allStatuses) {
        expect(statuses.has(status)).toBe(true);
      }
    });

    it('all four booking sources appear at least once', () => {
      const sources = new Set(dataset.bookings.map((b) => b.source));
      const allSources: BookingSource[] = ['website', 'whatsapp', 'instagram', 'reception'];
      for (const source of allSources) {
        expect(sources.has(source)).toBe(true);
      }
    });

    it('at least 4 sessions are full in the next 3 days', () => {
      const horizonEnd = addDaysISO(demoToday, 2);
      const fullCount = dataset.sessions.filter((session) => {
        if (session.status === 'cancelled') return false;
        if (session.date < demoToday || session.date > horizonEnd) return false;
        return session.capacity - (booked.get(session.id) ?? 0) <= 0;
      }).length;
      expect(fullCount).toBeGreaterThanOrEqual(4);
    });

    it('at least 6 sessions are almost_full across the whole window', () => {
      const almostFullCount = dataset.sessions.filter((session) => {
        if (session.status === 'cancelled') return false;
        const bookedCount = booked.get(session.id) ?? 0;
        const available = session.capacity - bookedCount;
        const rate = bookedCount / session.capacity;
        return available > 0 && rate >= 0.85;
      }).length;
      expect(almostFullCount).toBeGreaterThanOrEqual(6);
    });

    it('at least 1 session is available (in practice, dozens are)', () => {
      const availableCount = dataset.sessions.filter((session) => {
        if (session.status === 'cancelled') return false;
        const bookedCount = booked.get(session.id) ?? 0;
        const available = session.capacity - bookedCount;
        const rate = bookedCount / session.capacity;
        return available > 0 && rate < 0.85;
      }).length;
      expect(availableCount).toBeGreaterThanOrEqual(1);
    });

    it('exactly 6 sessions land on demoToday whenever demoToday is a weekday', () => {
      if (isWeekendISO(demoToday)) return; // the assertion only claims 6 on a weekday
      expect(dataset.sessions.filter((session) => session.date === demoToday)).toHaveLength(6);
    });

    it('Functional Training is among the top two class types by booking count', () => {
      const countByClassType = new Map<string, number>();
      for (const booking of dataset.bookings) {
        const classTypeId = sessionById.get(booking.sessionId)?.classTypeId;
        if (!classTypeId) continue;
        countByClassType.set(classTypeId, (countByClassType.get(classTypeId) ?? 0) + 1);
      }
      const top2 = [...countByClassType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id);
      expect(top2).toContain('ct-functional-training');
    });

    it('weekday and weekend sessions/day and bookings/session differ', () => {
      const weekdaySessions = dataset.sessions.filter((s) => !isWeekendISO(s.date));
      const weekendSessions = dataset.sessions.filter((s) => isWeekendISO(s.date));
      expect(weekdaySessions.length / 10).not.toBe(weekendSessions.length / 4);

      const sumBooked = (sessions: typeof dataset.sessions) =>
        sessions.reduce((sum, session) => sum + (booked.get(session.id) ?? 0), 0);
      expect(sumBooked(weekdaySessions) / weekdaySessions.length).not.toBe(
        sumBooked(weekendSessions) / weekendSessions.length,
      );
    });
  });

  describe('instructor status never contradicts the schedule (amendment A2, Codex M9)', () => {
    it('off_today instructors have no session today; in_class instructors have one spanning demoNow', () => {
      const todaySessionsByInstructor = new Map<string, typeof dataset.sessions>();
      for (const session of dataset.sessions) {
        if (session.date !== demoToday || session.status === 'cancelled') continue;
        const list = todaySessionsByInstructor.get(session.instructorId);
        if (list) list.push(session);
        else todaySessionsByInstructor.set(session.instructorId, [session]);
      }

      for (const instructor of dataset.instructors) {
        const todaySessions = todaySessionsByInstructor.get(instructor.id) ?? [];

        if (instructor.status === 'off_today') {
          expect(todaySessions).toHaveLength(0);
        }

        if (instructor.status === 'in_class') {
          const isMidSession = todaySessions.some((session) => {
            const startsAt = buildISODateTime(session.date, session.startTime);
            const endsAt = buildISODateTime(session.date, session.endTime);
            return dataset.demoNow >= startsAt && dataset.demoNow < endsAt;
          });
          expect(isMidSession).toBe(true);
        }
      }
    });
  });
});

describe('buildDemoDataset determinism', () => {
  it('produces byte-identical output across two calls with the same demoToday', () => {
    const a = buildDemoDataset('2026-09-17');
    const b = buildDemoDataset('2026-09-17');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

// The reviewer probe that motivated this suite ran buildDemoDataset under TZ=Pacific/Apia and
// got a different session count than under the machine's own timezone (Finding 2). The contract
// is dataset deep-equality across timezones for the same demoToday - not any particular session
// count - so that is what this asserts, across five zones chosen to cover the cases that break a
// naive local-time-crossing implementation: the trivial baseline (UTC), a negative fixed offset
// where a UTC-parsed date reads back as the PREVIOUS local day (America/Bogota, UTC-5), two large
// positive fixed offsets where a local-to-UTC conversion reads back a day early (Pacific/Apia
// UTC+13 and Pacific/Kiritimati UTC+14, the most extreme in either direction), and a
// non-hour-aligned offset (Asia/Kolkata, UTC+5:30).
describe('buildDemoDataset timezone independence (Finding 2)', () => {
  const ORIGINAL_TZ = process.env.TZ;

  afterEach(() => {
    if (ORIGINAL_TZ === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = ORIGINAL_TZ;
    }
  });

  const TIMEZONES = ['UTC', 'America/Bogota', 'Pacific/Apia', 'Pacific/Kiritimati', 'Asia/Kolkata'];

  it('is byte-identical across all five timezones for demoToday=2026-09-17', () => {
    const demoToday = '2026-09-17';
    const results = TIMEZONES.map((tz) => {
      process.env.TZ = tz;
      return { tz, json: JSON.stringify(buildDemoDataset(demoToday)) };
    });

    for (const result of results.slice(1)) {
      expect(result.json, `TZ=${result.tz} dataset differs from TZ=${results[0].tz}`).toBe(results[0].json);
    }
  });

  it('is byte-identical across all five timezones for every weekday anchor', () => {
    for (const demoToday of WEEKDAY_ANCHORS) {
      const results = TIMEZONES.map((tz) => {
        process.env.TZ = tz;
        return { tz, json: JSON.stringify(buildDemoDataset(demoToday)) };
      });

      for (const result of results.slice(1)) {
        expect(
          result.json,
          `demoToday=${demoToday}: TZ=${result.tz} dataset differs from TZ=${results[0].tz}`,
        ).toBe(results[0].json);
      }
    }
  });
});
