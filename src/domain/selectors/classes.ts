// Pure selectors over class types - docs/08-STATE-MANAGEMENT.md section 4.
import type { Booking, ClassOccupancyPoint, ClassSession, ClassType, ClassTypeWithStats, ISODate } from '@/domain/types';
import { getWeekdayIndex, isSameISOMonth } from '@/lib/dates';
import { indexBookingsBySession } from './bookings';
import { selectSessionOccupancy } from './sessions';

function averageOccupancyRate(sessions: ClassSession[], bookingsBySession: Map<string, Booking[]>): number {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce(
    (sum, session) => sum + selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []).occupancyRate,
    0,
  );
  return total / sessions.length;
}

// One point per class type; a class type with zero sessions in `sessions` returns rate 0
// rather than throwing (docs/11-TEST-PLAN.md section 3).
export function selectClassOccupancy(
  classTypes: ClassType[],
  sessions: ClassSession[],
  bookings: Booking[],
): ClassOccupancyPoint[] {
  const bookingsBySession = indexBookingsBySession(bookings);

  return classTypes.map((classType) => {
    const classSessions = sessions.filter(
      (session) => session.classTypeId === classType.id && session.status !== 'cancelled',
    );
    return {
      classTypeId: classType.id,
      name: classType.name,
      accent: classType.accent,
      occupancyRate: averageOccupancyRate(classSessions, bookingsBySession),
    };
  });
}

export interface ClassPopularityPoint {
  classTypeId: string;
  name: string;
  bookingCount: number;
}

// Ranked by total demand (every non-cancelled booking counts - a waitlist entry is still
// demand, a cancelled reservation is not).
export function selectClassPopularity(
  classTypes: ClassType[],
  sessions: ClassSession[],
  bookings: Booking[],
): ClassPopularityPoint[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const countByClassType = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    const classTypeId = sessionById.get(booking.sessionId)?.classTypeId;
    if (!classTypeId) continue;
    countByClassType.set(classTypeId, (countByClassType.get(classTypeId) ?? 0) + 1);
  }

  return classTypes
    .map((classType) => ({
      classTypeId: classType.id,
      name: classType.name,
      bookingCount: countByClassType.get(classType.id) ?? 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

export interface ClassWeekdayBookingPoint {
  day: string;
  bookings: number;
}

const WEEK_ORDER: { index: number; label: string }[] = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' },
];

// Bookings for one class type, bucketed by the weekday its session falls on
// (components/classes/ClassWeekdayChart, docs/07-COMPONENT-ARCHITECTURE.md).
export function selectClassWeekdayBookings(
  sessions: ClassSession[],
  bookings: Booking[],
  classTypeId: string,
): ClassWeekdayBookingPoint[] {
  const relevantSessions = sessions.filter(
    (session) => session.classTypeId === classTypeId && session.status !== 'cancelled',
  );
  const relevantSessionById = new Map(relevantSessions.map((session) => [session.id, session]));

  const countByWeekday = new Map<number, number>();
  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    const session = relevantSessionById.get(booking.sessionId);
    if (!session) continue;
    const weekday = getWeekdayIndex(session.date);
    countByWeekday.set(weekday, (countByWeekday.get(weekday) ?? 0) + 1);
  }

  return WEEK_ORDER.map(({ index, label }) => ({ day: label, bookings: countByWeekday.get(index) ?? 0 }));
}

export function selectClassTypeStats(
  classTypes: ClassType[],
  sessions: ClassSession[],
  bookings: Booking[],
  demoToday: ISODate,
): ClassTypeWithStats[] {
  const bookingsBySession = indexBookingsBySession(bookings);
  const sessionById = new Map(sessions.map((session) => [session.id, session]));

  return classTypes.map((classType) => {
    const classSessions = sessions.filter((session) => session.classTypeId === classType.id);
    const activeSessions = classSessions.filter((session) => session.status !== 'cancelled');
    const weeklySessions = Math.round(activeSessions.length / 2); // 14-day window = 2 weeks

    let bookingsThisMonth = 0;
    let cancelledCount = 0;
    let totalCount = 0;
    for (const booking of bookings) {
      const session = sessionById.get(booking.sessionId);
      if (!session || session.classTypeId !== classType.id) continue;
      totalCount += 1;
      if (booking.status === 'cancelled') {
        cancelledCount += 1;
      } else if (isSameISOMonth(session.date, demoToday)) {
        bookingsThisMonth += 1;
      }
    }

    return {
      ...classType,
      weeklySessions,
      averageOccupancy: averageOccupancyRate(activeSessions, bookingsBySession),
      bookingsThisMonth,
      cancellationRate: totalCount > 0 ? cancelledCount / totalCount : 0,
      instructorIds: [...new Set(classSessions.map((session) => session.instructorId))],
    };
  });
}
