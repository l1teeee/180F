// Pure selectors over instructors - docs/08-STATE-MANAGEMENT.md section 4.
import type { Booking, ClassSession, Instructor, InstructorWithStats, ISODate } from '@/domain/types';
import { isSameISOMonth } from '@/lib/dates';
import { indexBookingsBySession } from './bookings';
import { selectSessionOccupancy } from './sessions';

export function selectInstructorStats(
  instructor: Instructor,
  sessions: ClassSession[],
  bookings: Booking[],
  demoToday: ISODate,
): InstructorWithStats {
  const instructorSessions = sessions.filter((session) => session.instructorId === instructor.id);
  const activeSessions = instructorSessions.filter((session) => session.status !== 'cancelled');
  const weeklySessions = Math.round(activeSessions.length / 2); // 14-day window = 2 weeks
  const classesThisMonth = activeSessions.filter((session) => isSameISOMonth(session.date, demoToday)).length;

  const bookingsBySession = indexBookingsBySession(bookings);
  const rates = activeSessions.map(
    (session) => selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []).occupancyRate,
  );
  const occupancyRate = rates.length > 0 ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;

  const activeSessionIds = new Set(activeSessions.map((session) => session.id));
  let reservations = 0;
  for (const booking of bookings) {
    if (booking.status !== 'cancelled' && activeSessionIds.has(booking.sessionId)) reservations += 1;
  }

  return { ...instructor, weeklySessions, classesThisMonth, reservations, occupancyRate };
}
