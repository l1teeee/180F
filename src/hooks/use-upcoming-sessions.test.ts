// docs/11-TEST-PLAN.md section 3 - dashboard "Upcoming classes" must not show a session whose
// start time has already passed on the demo clock (demoNow), even when it is still today
// (demoToday). selectUpcomingSessions only filters by date, see sessions.test.ts.
import { describe, expect, it } from 'vitest';
import type { ClassType, Instructor, SessionCard } from '@/domain/types';
import { filterSessionsStartingAfter } from './use-upcoming-sessions';

const CLASS_TYPE: ClassType = {
  id: 'ct-functional-training',
  name: 'Functional Training',
  description: 'Full-body strength and conditioning.',
  durationMinutes: 50,
  defaultCapacity: 20,
  category: 'strength',
  accent: 'purple',
  icon: 'Dumbbell',
};

const INSTRUCTOR: Instructor = {
  id: 'ins-01',
  name: 'Instructor 01',
  avatar: null,
  specialty: 'Functional Training',
  rating: 4.8,
  status: 'available',
  bio: 'Coaches functional training and conditioning classes.',
};

function makeSessionCard(overrides: Partial<SessionCard> = {}): SessionCard {
  return {
    id: 'ses-test',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: '2026-09-18',
    startTime: '06:00',
    endTime: '06:50',
    capacity: 20,
    room: 'Studio A',
    status: 'scheduled',
    booked: 0,
    available: 20,
    occupancyRate: 0,
    occupancyState: 'available',
    waitlistCount: 0,
    overbooked: false,
    classType: CLASS_TYPE,
    instructor: INSTRUCTOR,
    ...overrides,
  };
}

describe('filterSessionsStartingAfter', () => {
  it('drops a session on demoToday whose start time is already past demoNow', () => {
    const demoNow = '2026-09-18T09:00:00.000-05:00';
    const alreadyHappened = makeSessionCard({ date: '2026-09-18', startTime: '06:00' });
    const stillToCome = makeSessionCard({ id: 'ses-later', date: '2026-09-18', startTime: '18:00' });

    const result = filterSessionsStartingAfter([alreadyHappened, stillToCome], demoNow);

    expect(result.map((session) => session.id)).toEqual(['ses-later']);
    expect(result.some((session) => session.startTime === '06:00')).toBe(false);
  });

  it('keeps every session on a later date regardless of start time', () => {
    const demoNow = '2026-09-18T23:00:00.000-05:00';
    const tomorrowEarly = makeSessionCard({ date: '2026-09-19', startTime: '06:00' });

    const result = filterSessionsStartingAfter([tomorrowEarly], demoNow);

    expect(result).toHaveLength(1);
  });
});
