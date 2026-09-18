import { useMemo } from 'react';
import { indexBookingsBySession, selectInstructorStats, selectSessionsByInstructor, toSessionCard } from '@/domain/selectors';
import type { AccentToken, ClassType, Instructor, InstructorWithStats, SessionCard } from '@/domain/types';
import { accentForCustomerId } from '@/lib/avatar';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

// Duplicated from use-instructors-roster.ts rather than shared: this feature's hooks are
// constrained to the use-classes-*.ts / use-instructors-*.ts filename prefixes (Phase 6 write
// set), so a generic helper file has nowhere to live without adding a third naming pattern.
function resolveInstructorAccent(instructor: Instructor, classTypes: ClassType[]): AccentToken {
  const primaryClass = classTypes.find((classType) => classType.name === instructor.specialty);
  return primaryClass?.accent ?? accentForCustomerId(instructor.id);
}

export interface InstructorDetailData {
  instructor: InstructorWithStats;
  accent: AccentToken;
  upcoming: SessionCard[]; // this instructor's sessions from demoToday forward, chronological
  recentClasses: SessionCard[]; // this instructor's past sessions, most recent first
}

// null while the demo clock has not hydrated yet, or once it has, when instructorId does not
// resolve to a seeded instructor - see use-class-detail.ts for the same convention.
export function useInstructorDetail(instructorId: string): InstructorDetailData | null {
  const instructors = useInstructorStore((state) => state.instructors);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return null;
    const instructor = instructors.find((candidate) => candidate.id === instructorId);
    if (!instructor) return null;

    const classTypeById = new Map(classTypes.map((classType) => [classType.id, classType]));
    const bookingsBySession = indexBookingsBySession(bookings);

    const cards: SessionCard[] = selectSessionsByInstructor(sessions, instructorId)
      .filter((session) => session.status !== 'cancelled')
      .map((session) => {
        const classType = classTypeById.get(session.classTypeId);
        if (!classType) throw new Error(`useInstructorDetail: session "${session.id}" has unknown classTypeId`);
        return toSessionCard(session, bookingsBySession.get(session.id) ?? [], classType, instructor);
      })
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));

    const upcoming = cards.filter((card) => card.date >= demoToday);
    const recentClasses = cards.filter((card) => card.date < demoToday).reverse();

    return {
      instructor: selectInstructorStats(instructor, sessions, bookings, demoToday),
      accent: resolveInstructorAccent(instructor, classTypes),
      upcoming,
      recentClasses,
    };
  }, [instructors, classTypes, sessions, bookings, demoToday, instructorId]);
}
