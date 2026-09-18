import { useMemo } from 'react';
import { selectInstructorStats } from '@/domain/selectors';
import type { AccentToken, ClassType, Instructor, InstructorWithStats } from '@/domain/types';
import { accentForCustomerId } from '@/lib/avatar';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

export interface InstructorRosterEntry extends InstructorWithStats {
  // docs/03-DESIGN-SYSTEM.md section 13 "Tint": instructors take their primary class type's
  // accent, not the id-cycling rule AvatarGroup falls back to for a person it cannot identify
  // as an instructor. Resolved once here from the already-loaded catalog, never from src/data.
  accent: AccentToken;
}

// Instructor.specialty is authored to match a ClassType.name 1:1 (src/data/instructors.ts) -
// this is the join that stands in for "primary class type" without importing the seed-only
// ELIGIBLE_INSTRUCTORS table, which components/hooks may not read (src/data is repository-layer).
function resolveInstructorAccent(instructor: Instructor, classTypes: ClassType[]): AccentToken {
  const primaryClass = classTypes.find((classType) => classType.name === instructor.specialty);
  return primaryClass?.accent ?? accentForCustomerId(instructor.id);
}

export function useInstructorsRoster(): InstructorRosterEntry[] | null {
  const instructors = useInstructorStore((state) => state.instructors);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return null;
    return instructors.map((instructor) => ({
      ...selectInstructorStats(instructor, sessions, bookings, demoToday),
      accent: resolveInstructorAccent(instructor, classTypes),
    }));
  }, [instructors, classTypes, sessions, bookings, demoToday]);
}
