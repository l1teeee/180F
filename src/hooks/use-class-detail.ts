import { useMemo } from 'react';
import {
  indexBookingsBySession,
  selectClassTypeStats,
  selectClassWeekdayBookings,
  selectSessionsByClassType,
  toSessionCard,
  type ClassWeekdayBookingPoint,
} from '@/domain/selectors';
import type { ClassTypeWithStats, Instructor, SessionCard } from '@/domain/types';
import { formatWeekdayShort } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

export interface ClassDetailData {
  classType: ClassTypeWithStats;
  instructors: Instructor[];
  sessions: SessionCard[]; // this class type's schedule, chronological, cancelled sessions excluded
  weekdayBookings: ClassWeekdayBookingPoint[];
  highlightDay: string; // today's weekday label, matches one entry in weekdayBookings ('Mon'...'Sun')
}

// null while the demo clock has not hydrated yet, or once it has, when classTypeId does not
// resolve to a seeded class type - the page distinguishes those two cases via useDemoStatus()
// before deciding whether to call notFound() (docs/06 section 2 "Not-found behavior").
export function useClassDetail(classTypeId: string): ClassDetailData | null {
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return null;
    const classType = selectClassTypeStats(classTypes, sessions, bookings, demoToday).find(
      (candidate) => candidate.id === classTypeId,
    );
    if (!classType) return null;

    const instructorById = new Map(instructors.map((instructor) => [instructor.id, instructor]));
    const classInstructors = classType.instructorIds
      .map((id) => instructorById.get(id))
      .filter((instructor): instructor is Instructor => Boolean(instructor));

    const bookingsBySession = indexBookingsBySession(bookings);
    const scheduleCards: SessionCard[] = selectSessionsByClassType(sessions, classTypeId)
      .filter((session) => session.status !== 'cancelled')
      .map((session) => {
        const instructor = instructorById.get(session.instructorId);
        // docs/04 invariant 1 equivalent for sessions: every seeded session's instructorId
        // resolves. An unresolved one is a data bug, not a row this list silently drops.
        if (!instructor) throw new Error(`useClassDetail: session "${session.id}" has unknown instructorId`);
        return toSessionCard(session, bookingsBySession.get(session.id) ?? [], classType, instructor);
      })
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));

    return {
      classType,
      instructors: classInstructors,
      sessions: scheduleCards,
      weekdayBookings: selectClassWeekdayBookings(sessions, bookings, classTypeId),
      highlightDay: formatWeekdayShort(demoToday),
    };
  }, [classTypes, instructors, sessions, bookings, demoToday, classTypeId]);
}
