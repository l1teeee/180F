// Steps 2 and 3 data (docs/06-ROUTES-AND-SCREENS.md section 3.14 "Step 2" / "Step 3"): the
// bookable date strip and, per date, the time slots with live occupancy. One pass over this
// class type's sessions builds both, using a Map index built once (docs/08-STATE-MANAGEMENT.md
// section 8.8) rather than filtering the full booking ledger once per session.
import { useMemo } from 'react';
import { indexBookingsBySession, selectSessionOccupancy, selectSessionsByClassType } from '@/domain/selectors';
import type { ISODate, SessionWithOccupancy } from '@/domain/types';
import { addDaysISO, buildISODateTime, daysBetweenISO, formatWeekdayShort, getDayOfMonth } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';
import { useSettingsStore } from '@/stores/settings.store';

export interface PublicDateOption {
  date: ISODate;
  label: string; // 'THU 17' (master plan section 36's literal pattern)
  available: boolean;
}

export interface UsePublicBookingSessionsResult {
  dates: PublicDateOption[];
  sessionsByDate: Map<ISODate, SessionWithOccupancy[]>;
}

const EMPTY_RESULT: UsePublicBookingSessionsResult = { dates: [], sessionsByDate: new Map() };

export function usePublicBookingSessions(classId: string | null): UsePublicBookingSessionsResult {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const settings = useSettingsStore((state) => state.settings);

  return useMemo(() => {
    if (!classId || !demoToday || !demoNow || !settings) return EMPTY_RESULT;

    const bookingsBySession = indexBookingsBySession(bookings);
    // Cancelled and already-started sessions are excluded here, at the source, so neither the
    // date strip nor the time-slot list has to filter them again (a session that already
    // started is never offered - selectBookingEligibility's 'session_started' reason exists
    // for the same case, but that selector also needs a resolved Customer, which the visitor
    // has not entered yet at steps 2-3).
    const bookableSessions = selectSessionsByClassType(sessions, classId).filter(
      (session) => session.status !== 'cancelled' && buildISODateTime(session.date, session.startTime) > demoNow,
    );

    const sessionsByDate = new Map<ISODate, SessionWithOccupancy[]>();
    for (const session of bookableSessions) {
      const withOccupancy = selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []);
      const existing = sessionsByDate.get(session.date);
      if (existing) existing.push(withOccupancy);
      else sessionsByDate.set(session.date, [withOccupancy]);
    }
    for (const daySessions of sessionsByDate.values()) {
      daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    const windowEnd = addDaysISO(demoToday, settings.booking.advanceBookingDays);
    const dayCount = daysBetweenISO(demoToday, windowEnd) + 1;
    const dates: PublicDateOption[] = Array.from({ length: dayCount }, (_, offset) => {
      const date = addDaysISO(demoToday, offset);
      return {
        date,
        label: `${formatWeekdayShort(date).toUpperCase()} ${getDayOfMonth(date)}`,
        // A date is offered when this class runs at all that day (master plan section 36:
        // "days with no availability visibly unavailable"). A day that runs but is entirely
        // full still gets its dot removed below and each slot explained - see date-step.tsx.
        available: (sessionsByDate.get(date)?.length ?? 0) > 0,
      };
    });

    return { dates, sessionsByDate };
  }, [classId, sessions, bookings, demoToday, demoNow, settings]);
}
