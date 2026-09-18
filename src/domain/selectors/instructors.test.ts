// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession, Instructor } from '@/domain/types';
import { buildDemoDataset } from '@/data/seed';
import { selectInstructorStats } from './instructors';

const DEMO_TODAY = '2026-09-17';

function makeInstructor(overrides: Partial<Instructor> = {}): Instructor {
  return {
    id: 'ins-01',
    name: 'Instructor 01',
    avatar: null,
    specialty: 'Functional Training',
    rating: 4.8,
    status: 'available',
    bio: 'Bio',
    ...overrides,
  };
}

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-0001',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: '2026-09-10',
    startTime: '06:00',
    endTime: '06:50',
    capacity: 10,
    room: 'Studio A',
    status: 'completed',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-0001',
    customerId: 'cus-0001',
    sessionId: 'ses-0001',
    status: 'confirmed',
    source: 'website',
    createdAt: '2026-09-05T09:00:00.000-05:00',
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

describe('selectInstructorStats', () => {
  it('weeklySessions is the active-session count over a 14-day window, rounded from two weeks', () => {
    const sessions = Array.from({ length: 5 }, (_, i) => makeSession({ id: `ses-${i}`, date: `2026-09-0${i + 1}` }));
    const stats = selectInstructorStats(makeInstructor(), sessions, [], DEMO_TODAY);
    expect(stats.weeklySessions).toBe(3); // round(5 / 2)
  });

  it('excludes cancelled sessions from weeklySessions and classesThisMonth', () => {
    const sessions = [
      makeSession({ id: 'ses-a', date: '2026-09-10', status: 'completed' }),
      makeSession({ id: 'ses-b', date: '2026-09-11', status: 'cancelled' }),
    ];
    const stats = selectInstructorStats(makeInstructor(), sessions, [], DEMO_TODAY);
    expect(stats.weeklySessions).toBe(1); // round(1 / 2)
    expect(stats.classesThisMonth).toBe(1);
  });

  it('classesThisMonth counts only active sessions in the demo month', () => {
    const sessions = [
      makeSession({ id: 'ses-this-month', date: '2026-09-10' }),
      makeSession({ id: 'ses-last-month', date: '2026-08-20' }),
    ];
    const stats = selectInstructorStats(makeInstructor(), sessions, [], DEMO_TODAY);
    expect(stats.classesThisMonth).toBe(1);
  });

  it('occupancyRate is 0, not NaN, when the instructor has no active sessions', () => {
    const stats = selectInstructorStats(makeInstructor(), [], [], DEMO_TODAY);
    expect(stats.occupancyRate).toBe(0);
    expect(Number.isNaN(stats.occupancyRate)).toBe(false);
  });

  it('occupancyRate is the average occupancy rate across the active sessions', () => {
    const sessions = [
      makeSession({ id: 'ses-full', capacity: 10 }),
      makeSession({ id: 'ses-half', capacity: 10 }),
    ];
    const bookings = [
      ...Array.from({ length: 10 }, (_, i) => makeBooking({ id: `bkg-full-${i}`, sessionId: 'ses-full' })),
      ...Array.from({ length: 5 }, (_, i) => makeBooking({ id: `bkg-half-${i}`, sessionId: 'ses-half' })),
    ];
    const stats = selectInstructorStats(makeInstructor(), sessions, bookings, DEMO_TODAY);
    expect(stats.occupancyRate).toBeCloseTo((1 + 0.5) / 2);
  });

  it('reservations counts non-cancelled bookings only for the instructor active sessions', () => {
    const sessions = [
      makeSession({ id: 'ses-a', instructorId: 'ins-01' }),
      makeSession({ id: 'ses-other-instructor', instructorId: 'ins-02' }),
      makeSession({ id: 'ses-cancelled', instructorId: 'ins-01', status: 'cancelled' }),
    ];
    const bookings = [
      makeBooking({ id: 'bkg-a', sessionId: 'ses-a', status: 'confirmed' }),
      makeBooking({ id: 'bkg-cancelled-booking', sessionId: 'ses-a', status: 'cancelled' }),
      makeBooking({ id: 'bkg-other-instructor', sessionId: 'ses-other-instructor', status: 'confirmed' }),
      makeBooking({ id: 'bkg-cancelled-session', sessionId: 'ses-cancelled', status: 'confirmed' }),
    ];
    const stats = selectInstructorStats(makeInstructor(), sessions, bookings, DEMO_TODAY);
    expect(stats.reservations).toBe(1); // only bkg-a
  });

  it('carries the base instructor fields through unchanged', () => {
    const instructor = makeInstructor({ name: 'Instructor 02', rating: 4.5 });
    const stats = selectInstructorStats(instructor, [], [], DEMO_TODAY);
    expect(stats.name).toBe('Instructor 02');
    expect(stats.rating).toBe(4.5);
  });
});

describe('selectInstructorStats over the real dataset', () => {
  it('resolves every instructor without throwing and stays within valid ranges', () => {
    const dataset = buildDemoDataset(DEMO_TODAY);
    for (const instructor of dataset.instructors) {
      const stats = selectInstructorStats(instructor, dataset.sessions, dataset.bookings, DEMO_TODAY);
      expect(stats.weeklySessions).toBeGreaterThanOrEqual(0);
      expect(stats.occupancyRate).toBeGreaterThanOrEqual(0);
      expect(stats.occupancyRate).toBeLessThanOrEqual(1);
    }
  });
});
