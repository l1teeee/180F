// New-booking-dialog data (docs/06-ROUTES-AND-SCREENS.md section 3.4 "New booking flow" +
// docs/03-DESIGN-SYSTEM.md section 11.4-A). Deliberately not a reuse of
// use-public-booking-sessions.ts even though the shape rhymes: that hook (a) restricts to the
// five publicly-curated class types and (b) is fine dropping a session once it fills, because the
// public flow never offers a waitlist. Neither holds for the admin dialog - every class type is
// bookable here, and a full session must stay selectable so "Join waitlist" (docs/03 11.4-A) has
// something to join. Composes the existing selectSessionsByClassType/selectSessionOccupancy pure
// selectors (docs/08-STATE-MANAGEMENT.md section 8.3 style) rather than adding a domain file.
import { useMemo } from 'react';
import { indexBookingsBySession, selectSessionOccupancy, selectSessionsByClassType } from '@/domain/selectors';
import type { ISODate, SessionWithOccupancy } from '@/domain/types';
import { addDaysISO, buildISODateTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';
import { useSettingsStore } from '@/stores/settings.store';

export interface UseBookingsSessionOptionsResult {
  dates: ISODate[]; // ascending, only dates this class type actually runs on within the bookable window
  sessionsByDate: Map<ISODate, SessionWithOccupancy[]>; // ascending by start time; full sessions stay included
}

const EMPTY_RESULT: UseBookingsSessionOptionsResult = { dates: [], sessionsByDate: new Map() };

export function useBookingsSessionOptions(classTypeId: string | null): UseBookingsSessionOptionsResult {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const settings = useSettingsStore((state) => state.settings);

  return useMemo(() => {
    if (!classTypeId || !demoToday || !demoNow || !settings) return EMPTY_RESULT;

    const latestBookableDate = addDaysISO(demoToday, settings.booking.advanceBookingDays);
    const bookingsBySession = indexBookingsBySession(bookings);

    // Same window selectBookingEligibility itself enforces (session not started, within the
    // advance-booking days) so nearly every pick this UI offers actually succeeds; a real
    // capacity race is still caught and explained inline by the dialog's submit handler, same as
    // the public wizard's submitError pattern.
    const bookableSessions = selectSessionsByClassType(sessions, classTypeId).filter(
      (session) =>
        session.status !== 'cancelled' &&
        buildISODateTime(session.date, session.startTime) > demoNow &&
        session.date <= latestBookableDate,
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

    return { dates: [...sessionsByDate.keys()].sort(), sessionsByDate };
  }, [classTypeId, sessions, bookings, demoToday, demoNow, settings]);
}
