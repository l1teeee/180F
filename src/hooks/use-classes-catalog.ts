import { useMemo } from 'react';
import { selectClassTypeStats } from '@/domain/selectors';
import type { ClassTypeWithStats, Instructor } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

export interface ClassesCatalog {
  classTypes: ClassTypeWithStats[];
  // Built once here rather than inside ClassGrid's row loop (CLAUDE.md "build index maps
  // once per hook, never inside a row") - ClassCard's instructor list is a per-row .get().
  instructorById: Map<string, Instructor>;
}

export function useClassesCatalog(): ClassesCatalog | null {
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return null;
    return {
      classTypes: selectClassTypeStats(classTypes, sessions, bookings, demoToday),
      instructorById: new Map(instructors.map((instructor) => [instructor.id, instructor])),
    };
  }, [classTypes, instructors, sessions, bookings, demoToday]);
}
