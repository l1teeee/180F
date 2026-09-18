import { useMemo } from 'react';
import { selectClassOccupancy, selectClassPopularity } from '@/domain/selectors';
import type { ClassOccupancyPoint } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useSessionStore } from '@/stores/session.store';

// docs/06-ROUTES-AND-SCREENS.md section 3.2 names selectClassOccupancy as the Class occupancy
// region's selector, but master plan section 19 and this screen's brief also require the list
// "ordered by demand" - no domain selector ranks ClassOccupancyPoint[] by demand, so this hook
// composes selectClassOccupancy with selectClassPopularity's ranking instead of adding one to
// src/domain (docs/12-AGENT-OWNERSHIP.md feature-wave rule: agents compose gaps in their own
// hook and report them, never edit src/domain/**). Reported as a gap in the phase 3 handoff.
export function useDashboardClassOccupancy(): ClassOccupancyPoint[] {
  const classTypes = useCatalogStore((state) => state.classTypes);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);

  return useMemo(() => {
    const occupancyByClassType = new Map(
      selectClassOccupancy(classTypes, sessions, bookings).map((point) => [point.classTypeId, point]),
    );
    return selectClassPopularity(classTypes, sessions, bookings)
      .map((popularity) => occupancyByClassType.get(popularity.classTypeId))
      .filter((point): point is ClassOccupancyPoint => point !== undefined);
  }, [classTypes, sessions, bookings]);
}
