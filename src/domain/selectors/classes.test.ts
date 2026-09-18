// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession, ClassType } from '@/domain/types';
import { buildDemoDataset } from '@/data/seed';
import { selectClassOccupancy } from './classes';

const DEMO_TODAY = '2026-09-17';

function makeClassType(overrides: Partial<ClassType> = {}): ClassType {
  return {
    id: 'ct-functional-training',
    name: 'Functional Training',
    description: 'Full-body compound movements.',
    durationMinutes: 50,
    defaultCapacity: 15,
    category: 'strength',
    accent: 'purple',
    icon: 'Dumbbell',
    ...overrides,
  };
}

describe('selectClassOccupancy', () => {
  it('returns one point per class type', () => {
    const classTypes = [makeClassType({ id: 'ct-a' }), makeClassType({ id: 'ct-b' })];
    const points = selectClassOccupancy(classTypes, [], []);
    expect(points).toHaveLength(2);
    expect(points.map((p) => p.classTypeId)).toEqual(['ct-a', 'ct-b']);
  });

  it('a class type with zero sessions in the window does not throw and returns occupancyRate 0', () => {
    const classTypes = [makeClassType({ id: 'ct-empty' })];
    const points = selectClassOccupancy(classTypes, [], []);
    expect(points[0].occupancyRate).toBe(0);
  });

  it('occupancyRate is the average of each session occupancyRate for that class type', () => {
    const classType = makeClassType({ id: 'ct-a' });
    const sessions: ClassSession[] = [
      { id: 'ses-1', classTypeId: 'ct-a', instructorId: 'ins-01', date: DEMO_TODAY, startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled' },
      { id: 'ses-2', classTypeId: 'ct-a', instructorId: 'ins-01', date: DEMO_TODAY, startTime: '07:30', endTime: '08:20', capacity: 10, room: 'Studio A', status: 'scheduled' },
    ];
    // ses-1: 5/10 = 0.5, ses-2: 10/10 = 1.0 -> average 0.75
    const bookings: Booking[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `b1-${i}`, customerId: `cus-${i}`, sessionId: 'ses-1', status: 'confirmed' as const,
        source: 'website' as const, createdAt: '2026-09-01T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null,
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `b2-${i}`, customerId: `cus-${i}`, sessionId: 'ses-2', status: 'confirmed' as const,
        source: 'website' as const, createdAt: '2026-09-01T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null,
      })),
    ];
    const points = selectClassOccupancy([classType], sessions, bookings);
    expect(points[0].occupancyRate).toBeCloseTo(0.75, 10);
  });

  it('excludes cancelled sessions from the average', () => {
    const classType = makeClassType({ id: 'ct-a' });
    const sessions: ClassSession[] = [
      { id: 'ses-1', classTypeId: 'ct-a', instructorId: 'ins-01', date: DEMO_TODAY, startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'cancelled' },
    ];
    const points = selectClassOccupancy([classType], sessions, []);
    expect(points[0].occupancyRate).toBe(0);
  });

  it('carries the class type accent through, unchanged', () => {
    const classType = makeClassType({ id: 'ct-a', accent: 'pink' });
    const points = selectClassOccupancy([classType], [], []);
    expect(points[0].accent).toBe('pink');
  });
});

describe('selectClassOccupancy over the real dataset', () => {
  it('returns exactly 8 points, all with a rate between 0 and 1', () => {
    const dataset = buildDemoDataset(DEMO_TODAY);
    const points = selectClassOccupancy(dataset.classTypes, dataset.sessions, dataset.bookings);
    expect(points).toHaveLength(8);
    for (const point of points) {
      expect(point.occupancyRate).toBeGreaterThanOrEqual(0);
      expect(point.occupancyRate).toBeLessThanOrEqual(1);
    }
  });
});
