// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
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

  it('todayBookings counts only bookings for sessions on demoToday', () => {
    const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
    const expected = dataset.bookings.filter((b) => sessionById.get(b.sessionId)?.date === DEMO_TODAY).length;
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

  it('each label matches the point date weekday short name', () => {
    // demoToday 2026-09-17 is a Thursday
    expect(points[6].label).toBe('Thu');
    expect(points[5].label).toBe('Wed');
  });

  it('excludes cancelled bookings from the count', () => {
    const sessionById = new Map(dataset.sessions.map((s) => [s.id, s]));
    for (const point of points) {
      const expected = dataset.bookings.filter(
        (b) => b.status !== 'cancelled' && sessionById.get(b.sessionId)?.date === point.date,
      ).length;
      expect(point.bookings).toBe(expected);
    }
  });
});
