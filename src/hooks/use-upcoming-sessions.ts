import { useMemo } from 'react';
import { selectUpcomingSessions } from '@/domain/selectors';
import type { SessionCard } from '@/domain/types';
import { buildISODateTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

// selectUpcomingSessions (src/domain/selectors/sessions.ts) filters by session.date >= demoToday,
// a day-granularity check by design (see its test in sessions.test.ts). A session earlier today
// that has already started still passes that check, so this hook re-filters against demoNow the
// same way the booking time picker does (use-bookings-session-options.ts:
// buildISODateTime(session.date, session.startTime) > demoNow). Composing the gap here instead of
// editing src/domain follows the pattern already documented in use-dashboard-class-occupancy.ts.
export function filterSessionsStartingAfter(sessions: SessionCard[], demoNow: string): SessionCard[] {
  return sessions.filter((session) => buildISODateTime(session.date, session.startTime) > demoNow);
}

export function useUpcomingSessions(limit = 4): SessionCard[] {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);

  return useMemo(() => {
    if (!demoToday || !demoNow) return [];
    // Over-fetch past `limit` (selectUpcomingSessions slices before we can filter) so removing
    // already-started sessions doesn't leave the widget short of `limit` items.
    const candidates = selectUpcomingSessions(sessions, bookings, classTypes, instructors, demoToday, sessions.length);
    return filterSessionsStartingAfter(candidates, demoNow).slice(0, limit);
  }, [sessions, bookings, classTypes, instructors, demoToday, demoNow, limit]);
}
