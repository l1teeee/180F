import { useMemo } from 'react';
import { toSessionCard } from '@/domain/selectors';
import type { SessionCard } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

export function useSessionCard(sessionId: string): SessionCard | null {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);

  return useMemo(() => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    const classType = classTypes.find((c) => c.id === session.classTypeId);
    const instructor = instructors.find((i) => i.id === session.instructorId);
    if (!classType || !instructor) return null;
    const bookingsForSession = bookings.filter((b) => b.sessionId === sessionId);
    return toSessionCard(session, bookingsForSession, classType, instructor);
  }, [sessions, bookings, classTypes, instructors, sessionId]);
}
