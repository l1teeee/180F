// Step 1 data (docs/06-ROUTES-AND-SCREENS.md section 3.14 "Step 1"). Composes
// selectSessionsByClassType + selectSessionOccupancy per class type, exactly as that section
// specifies, because no existing selector already returns "available session count per class
// type" - selectClassTypeStats (domain/selectors/classes.ts) answers a different question
// (weeklySessions/averageOccupancy/bookingsThisMonth), so it is not reused here for a shape it
// doesn't have (docs/08-STATE-MANAGEMENT.md section 8.3 style: compose from existing pure
// selectors, don't invent a new one under src/domain - this agent cannot write there anyway).
import { useMemo } from 'react';
import { indexBookingsBySession, selectSessionOccupancy, selectSessionsByClassType } from '@/domain/selectors';
import type { ClassType } from '@/domain/types';
import { addDaysISO, buildISODateTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';
import { useSettingsStore } from '@/stores/settings.store';

// Master plan section 35's explicit list - the public flow surfaces this curated subset of the
// catalog's 8 class types (docs/06 section 3.14: "this document's decision ... not all 8 admin
// class types"). Order here is the display order.
export const PUBLIC_BOOKING_CLASS_IDS = [
  'ct-functional-training',
  'ct-cycling',
  'ct-yoga',
  'ct-pilates',
  'ct-hiit',
] as const;

export function isPublicBookingClassId(id: string): boolean {
  return (PUBLIC_BOOKING_CLASS_IDS as readonly string[]).includes(id);
}

export interface PublicClassOption {
  classType: ClassType;
  availableSessionCount: number;
}

export function usePublicBookingCatalog(): PublicClassOption[] {
  const classTypes = useCatalogStore((state) => state.classTypes);
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const settings = useSettingsStore((state) => state.settings);

  return useMemo(() => {
    if (!demoToday || !demoNow || !settings) return [];
    const latestBookableDate = addDaysISO(demoToday, settings.booking.advanceBookingDays);
    // Built once, not once per class type (docs/08 section 8.8: a Map index built once per
    // hook call, never a linear scan repeated inside a loop over the full ledger).
    const bookingsBySession = indexBookingsBySession(bookings);

    return PUBLIC_BOOKING_CLASS_IDS.map((id) => classTypes.find((classType) => classType.id === id))
      .filter((classType): classType is ClassType => classType != null)
      .map((classType) => {
        // `buildISODateTime(...) > demoNow`, not `date >= demoToday`: a session scheduled
        // earlier today that has already started must not count as available here, matching
        // use-public-booking-sessions.ts's own filter exactly - two screens counting this
        // differently is exactly the "a number that disagrees between two screens" defect
        // CLAUDE.md calls out, and it was caught live: Pilates showed "2 sessions available"
        // on step 1 while step 3 could only ever list 1, because the second one was today's
        // and already over.
        const bookableSessions = selectSessionsByClassType(sessions, classType.id).filter(
          (session) =>
            session.status === 'scheduled' &&
            buildISODateTime(session.date, session.startTime) > demoNow &&
            session.date <= latestBookableDate,
        );
        const availableSessionCount = bookableSessions.filter(
          (session) =>
            selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []).occupancyState !== 'full',
        ).length;
        return { classType, availableSessionCount };
      });
  }, [classTypes, sessions, bookings, demoToday, demoNow, settings]);
}
