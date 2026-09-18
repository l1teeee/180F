// Phase 4 (docs/06-ROUTES-AND-SCREENS.md section 3.3): "useSessionStore.sessions joined with
// useCatalogStore.classTypes (for the class-accent colour) and useInstructorStore.instructors to
// build FullCalendar events." No selector already returns FullCalendar-shaped output, so this
// hook composes the existing toSessionCard/indexBookingsBySession selectors itself
// (docs/08-STATE-MANAGEMENT.md section 8.3 style) rather than adding a new domain/selectors file.
import { useMemo } from 'react';
import type { EventInput } from '@fullcalendar/core';
import { indexBookingsBySession, toSessionCard } from '@/domain/selectors';
import type { AccentToken, OccupancyState } from '@/domain/types';
import { buildISODateTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';

// Extra facts a FullCalendar event needs beyond FullCalendar's own DateInput/id/title fields -
// carried in extendedProps and read back by schedule-calendar.tsx's eventContent renderer, so the
// event-click handler never has to re-look-up the session it was already given.
export interface CalendarSessionEventProps {
  classTypeId: string;
  instructorName: string;
  room: string;
  booked: number;
  capacity: number;
  occupancyState: OccupancyState;
  overbooked: boolean;
}

// CSS custom-property references, never hex (CLAUDE.md design invariant: "Tokens live only in
// src/app/globals.css. No hex colour anywhere else."). `element.style.backgroundColor = 'var(--x)'`
// resolves at paint time exactly like a literal colour would, so FullCalendar's per-event
// backgroundColor/borderColor props work unchanged with a token reference instead of a hex value.
// Solid (not the pastel -soft) token for the border/text-adjacent mark, matching
// occupancy-bar.tsx's ACCENT_FILL_CLASSNAME convention: purple stays the data-mark tone here
// (ADR-020 only reserves purple-deep for button fills).
const ACCENT_EVENT_COLOR: Record<AccentToken, { background: string; border: string }> = {
  purple: { background: 'var(--color-purple-soft)', border: 'var(--color-purple)' },
  yellow: { background: 'var(--color-yellow-soft)', border: 'var(--color-yellow)' },
  green: { background: 'var(--color-green-soft)', border: 'var(--color-green)' },
  pink: { background: 'var(--color-pink-soft)', border: 'var(--color-pink)' },
  blue: { background: 'var(--color-blue-soft)', border: 'var(--color-blue)' },
};

export function useCalendarEvents(): EventInput[] {
  const sessions = useSessionStore((state) => state.sessions);
  const bookings = useBookingStore((state) => state.bookings);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);

  return useMemo(() => {
    // Map indexes built once per call, never re-scanned per session (docs/08 section 8.8).
    const bookingsBySession = indexBookingsBySession(bookings);
    const classTypeById = new Map(classTypes.map((classType) => [classType.id, classType]));
    const instructorById = new Map(instructors.map((instructor) => [instructor.id, instructor]));

    const events: EventInput[] = [];
    for (const session of sessions) {
      const classType = classTypeById.get(session.classTypeId);
      const instructor = instructorById.get(session.instructorId);
      // docs/04-DOMAIN-MODEL.md invariant 1 says this cannot happen; dropped defensively rather
      // than thrown, matching to-booking-row.ts's toBookingRow for the same kind of cross-store
      // join sitting inside a render.
      if (!classType || !instructor) continue;

      const card = toSessionCard(session, bookingsBySession.get(session.id) ?? [], classType, instructor);
      const color = ACCENT_EVENT_COLOR[classType.accent];

      events.push({
        id: session.id,
        title: classType.name,
        start: buildISODateTime(session.date, session.startTime),
        end: buildISODateTime(session.date, session.endTime),
        backgroundColor: color.background,
        borderColor: color.border,
        textColor: 'var(--color-ink)',
        extendedProps: {
          classTypeId: classType.id,
          instructorName: instructor.name,
          room: session.room,
          booked: card.booked,
          capacity: session.capacity,
          occupancyState: card.occupancyState,
          overbooked: card.overbooked,
        } satisfies CalendarSessionEventProps,
      });
    }
    return events;
  }, [sessions, bookings, classTypes, instructors]);
}
