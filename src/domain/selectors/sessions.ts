// Occupancy arithmetic lives only here (ADR-008, CLAUDE.md architecture invariant 5) - no
// other file computes booked/available/occupancyRate/occupancyState from a booking list.
import type {
  Booking,
  ClassSession,
  ClassType,
  Instructor,
  ISODate,
  OccupancyState,
  SessionCard,
  SessionWithOccupancy,
} from '@/domain/types';
import { ALMOST_FULL_OCCUPANCY_THRESHOLD } from '@/domain/constants';
import { indexBookingsBySession } from './bookings';

// `bookingsForSession` must already be narrowed to this one session (docs/02-ARCHITECTURE.md
// section 4's selector sketch) - callers that hold the full ledger use indexBookingsBySession
// (or one of the *ById maps built alongside it below) first.
export function selectSessionOccupancy(session: ClassSession, bookingsForSession: Booking[]): SessionWithOccupancy {
  const booked = bookingsForSession.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
  const waitlistCount = bookingsForSession.filter((b) => b.status === 'waitlist').length;
  const overbooked = booked > session.capacity;
  const available = Math.max(0, session.capacity - booked);
  // Clamped to [0, 1] for display - a shrunk capacity (docs/master-plan 22's Edit class action)
  // can put booked > capacity, and a bar/percentage must never read past 100%. `booked` above
  // stays the raw ledger count and `overbooked` flags the discrepancy explicitly (ADR-008): the
  // clamp only affects this rendered rate, never the truth it is computed from.
  const occupancyRate =
    session.capacity > 0 ? Math.min(1, booked / session.capacity) : booked > 0 ? 1 : 0;
  const occupancyState: OccupancyState =
    available <= 0 ? 'full' : occupancyRate >= ALMOST_FULL_OCCUPANCY_THRESHOLD ? 'almost_full' : 'available';

  return { ...session, booked, available, occupancyRate, occupancyState, waitlistCount, overbooked };
}

export function toSessionCard(
  session: ClassSession,
  bookingsForSession: Booking[],
  classType: ClassType,
  instructor: Instructor,
): SessionCard {
  return { ...selectSessionOccupancy(session, bookingsForSession), classType, instructor };
}

function buildLookups(classTypes: ClassType[], instructors: Instructor[]) {
  return {
    classTypeById: new Map(classTypes.map((classType) => [classType.id, classType])),
    instructorById: new Map(instructors.map((instructor) => [instructor.id, instructor])),
  };
}

export function selectUpcomingSessions(
  sessions: ClassSession[],
  bookings: Booking[],
  classTypes: ClassType[],
  instructors: Instructor[],
  demoToday: ISODate,
  limit = 4,
): SessionCard[] {
  const bookingsBySession = indexBookingsBySession(bookings);
  const { classTypeById, instructorById } = buildLookups(classTypes, instructors);

  return sessions
    .filter((session) => session.status === 'scheduled' && session.date >= demoToday)
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
    .slice(0, limit)
    .map((session) =>
      toSessionCard(
        session,
        bookingsBySession.get(session.id) ?? [],
        classTypeById.get(session.classTypeId)!,
        instructorById.get(session.instructorId)!,
      ),
    );
}

export function selectAlmostFullSessions(
  sessions: ClassSession[],
  bookings: Booking[],
  classTypes: ClassType[],
  instructors: Instructor[],
): SessionCard[] {
  const bookingsBySession = indexBookingsBySession(bookings);
  const { classTypeById, instructorById } = buildLookups(classTypes, instructors);

  return sessions
    .filter((session) => session.status !== 'cancelled')
    .map((session) =>
      toSessionCard(
        session,
        bookingsBySession.get(session.id) ?? [],
        classTypeById.get(session.classTypeId)!,
        instructorById.get(session.instructorId)!,
      ),
    )
    .filter((card) => card.occupancyState === 'almost_full');
}

export function selectSessionsByDate(sessions: ClassSession[], date: ISODate): ClassSession[] {
  return sessions.filter((session) => session.date === date);
}

export function selectSessionsByClassType(sessions: ClassSession[], classTypeId: string): ClassSession[] {
  return sessions.filter((session) => session.classTypeId === classTypeId);
}

export function selectSessionsByInstructor(sessions: ClassSession[], instructorId: string): ClassSession[] {
  return sessions.filter((session) => session.instructorId === instructorId);
}
