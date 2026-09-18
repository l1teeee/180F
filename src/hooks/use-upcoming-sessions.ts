import { useMemo } from 'react';
import { selectUpcomingSessions } from '@/domain/selectors';
import type { SessionCard } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

export function useUpcomingSessions(limit = 4): SessionCard[] {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return [];
    return selectUpcomingSessions(sessions, bookings, classTypes, instructors, demoToday, limit);
  }, [sessions, bookings, classTypes, instructors, demoToday, limit]);
}
