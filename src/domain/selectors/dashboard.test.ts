// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking } from '@/domain/types';
import { buildDemoDataset } from '@/data/seed';
import { selectDashboardKpis } from './dashboard';
import { selectWeeklyBookingTrend } from './bookings';

const DEMO_TODAY = '2026-09-17';

describe('selectDashboardKpis', () => {
  const dataset = buildDemoDataset(DEMO_TODAY);
  const kpis = selectDashboardKpis(dataset.customers, dataset.bookings, dataset.sessions, DEMO_TODAY);

  it('activeMembers counts only status === active customers (ADR-016: 132, not the 148 total)', () => {
    const expected = dataset.customers.filter((c) => c.status === 'active').length;
    expect(kpis.activeMembers).toBe(expected);
    expect(kpis.activeMembers).toBe(132);
  });

  it('activeMembersDelta counts customers whose joinedAt falls in the current demo month', () => {
    const expected = dataset.customers.filter((c) => c.joinedAt.slice(0, 7) === DEMO_TODAY.slice(0, 7)).length;
    expect(kpis.activeMembersDelta).toBe(expected);
  });

  it('todayBookings counts only confirmed or pending bookings for sessions on demoToday (ADR-023)', () => {
    const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
    const expected = dataset.bookings.filter(
      (b) => (b.status === 'confirmed' || b.status === 'pending') && sessionById.get(b.sessionId)?.date === DEMO_TODAY,
    ).length;
    expect(kpis.todayBookings).toBe(expected);
  });

  it('occupancyRate is the aggregate of today sessions (total booked / total capacity), not an average of rates', () => {
    const bookedBySession = new Map<string, number>();
    for (const b of dataset.bookings) {
      if (b.status === 'confirmed' || b.status === 'pending') {
        bookedBySession.set(b.sessionId, (bookedBySession.get(b.sessionId) ?? 0) + 1);
      }
    }
    let booked = 0;
    let capacity = 0;
    for (const session of dataset.sessions) {
      if (session.date !== DEMO_TODAY || session.status === 'cancelled') continue;
      booked += bookedBySession.get(session.id) ?? 0;
      capacity += session.capacity;
    }
    expect(kpis.occupancyRate).toBeCloseTo(booked / capacity, 10);
    // guard against the average-of-rates bug: only meaningful when today's session capacities differ
    const distinctCapacities = new Set(
      dataset.sessions.filter((s) => s.date === DEMO_TODAY).map((s) => s.capacity),
    );
    expect(distinctCapacities.size).toBeGreaterThan(1);
  });

  it('todayAlmostFull counts sessions in the almost_full state today', () => {
    expect(kpis.todayAlmostFull).toBeGreaterThanOrEqual(0);
    expect(kpis.todayAlmostFull).toBeLessThanOrEqual(kpis.todayClasses);
  });

  it('todayClasses equals the count of non-cancelled sessions today (6, a weekday)', () => {
    expect(kpis.todayClasses).toBe(6);
  });
});

describe('selectWeeklyBookingTrend', () => {
  const dataset = buildDemoDataset(DEMO_TODAY);
  const points = selectWeeklyBookingTrend(dataset.bookings, dataset.sessions, DEMO_TODAY);

  it('returns exactly 7 points ending on demoToday, in chronological order', () => {
    expect(points).toHaveLength(7);
    expect(points[6].date).toBe(DEMO_TODAY);
    for (let i = 1; i < points.length; i++) {
      expect(points[i - 1].date < points[i].date).toBe(true);
    }
  });

  it('counts only confirmed or pending bookings, excluding cancelled and waitlist (ADR-023)', () => {
    const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
    for (const point of points) {
      const expected = dataset.bookings.filter(
        (b) => (b.status === 'confirmed' || b.status === 'pending') && sessionById.get(b.sessionId)?.date === point.date,
      ).length;
      expect(point.bookings).toBe(expected);
    }
  });
});

// ADR-023: "a booking counts toward a day when its session is on that day and its status is
// confirmed or pending" is defined once (selectBookingCountsByDate, bookings.ts) and read by
// both selectDashboardKpis's todayBookings and selectWeeklyBookingTrend's last point. These
// tests drive both selectors off the same mutated booking lists to prove they can never diverge.
describe('ADR-023: the KPI and the weekly chart\'s today bar agree', () => {
  const dataset = buildDemoDataset(DEMO_TODAY);
  const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
  const todaySession = dataset.sessions.find((s) => s.date === DEMO_TODAY);
  if (!todaySession) throw new Error('fixture expectation: at least one session on demoToday');
  const todaySessionId = todaySession.id;

  function todayCounts(bookings: Booking[]) {
    const kpis = selectDashboardKpis(dataset.customers, bookings, dataset.sessions, DEMO_TODAY);
    const trend = selectWeeklyBookingTrend(bookings, dataset.sessions, DEMO_TODAY);
    return { kpi: kpis.todayBookings, chart: trend[trend.length - 1].bookings };
  }

  function makeBooking(overrides: Partial<Booking>): Booking {
    return {
      id: 'bkg-adr023-test',
      customerId: dataset.customers[0].id,
      sessionId: todaySessionId,
      status: 'confirmed',
      source: 'reception',
      createdAt: `${DEMO_TODAY}T09:00:00.000-05:00`,
      checkedInAt: null,
      cancelledAt: null,
      ...overrides,
    };
  }

  it('the KPI and the chart\'s today bar are the same number', () => {
    const { kpi, chart } = todayCounts(dataset.bookings);
    expect(kpi).toBe(chart);
    expect(kpi).toBeGreaterThan(0);
  });

  it('creating a confirmed booking for today raises both by exactly one', () => {
    const before = todayCounts(dataset.bookings);
    const after = todayCounts([...dataset.bookings, makeBooking({ status: 'confirmed' })]);
    expect(after.kpi).toBe(before.kpi + 1);
    expect(after.chart).toBe(before.chart + 1);
    expect(after.kpi).toBe(after.chart);
  });

  it('cancelling a confirmed or pending booking for today lowers both by exactly one', () => {
    const target = dataset.bookings.find(
      (b) => (b.status === 'confirmed' || b.status === 'pending') && sessionById.get(b.sessionId)?.date === DEMO_TODAY,
    );
    if (!target) throw new Error('fixture expectation: at least one confirmed/pending booking today');

    const before = todayCounts(dataset.bookings);
    const cancelled = dataset.bookings.map((b) =>
      b.id === target.id ? { ...b, status: 'cancelled' as const, cancelledAt: `${DEMO_TODAY}T09:30:00.000-05:00` } : b,
    );
    const after = todayCounts(cancelled);
    expect(after.kpi).toBe(before.kpi - 1);
    expect(after.chart).toBe(before.chart - 1);
    expect(after.kpi).toBe(after.chart);
  });

  it('a waitlist booking for today changes neither the KPI nor the chart bar', () => {
    const before = todayCounts(dataset.bookings);
    const after = todayCounts([...dataset.bookings, makeBooking({ id: 'bkg-adr023-waitlist', status: 'waitlist' })]);
    expect(after.kpi).toBe(before.kpi);
    expect(after.chart).toBe(before.chart);
  });
});
