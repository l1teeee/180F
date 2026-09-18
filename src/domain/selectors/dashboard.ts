// docs/08-STATE-MANAGEMENT.md section 4. activeMembers goes through selectActiveMembers,
// not customers.length, per ADR-016 (132 active out of 148 total customers).
import type { Booking, ClassSession, Customer, DashboardKpis, ISODate } from '@/domain/types';
import { addDaysISO } from '@/lib/dates';
import { indexBookingsBySession } from './bookings';
import { selectSessionOccupancy } from './sessions';
import { selectActiveMembers, selectNewThisMonth } from './customers';

export function selectDashboardKpis(
  customers: Customer[],
  bookings: Booking[],
  sessions: ClassSession[],
  demoToday: ISODate,
): DashboardKpis {
  const activeMembers = selectActiveMembers(customers);
  const activeMembersDelta = selectNewThisMonth(customers, demoToday);

  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const yesterday = addDaysISO(demoToday, -1);

  let todayBookingsCount = 0;
  let yesterdayBookingsCount = 0;
  for (const booking of bookings) {
    const date = sessionById.get(booking.sessionId)?.date;
    if (date === demoToday) todayBookingsCount += 1;
    else if (date === yesterday) yesterdayBookingsCount += 1;
  }
  const todayBookingsDeltaPct =
    yesterdayBookingsCount > 0
      ? ((todayBookingsCount - yesterdayBookingsCount) / yesterdayBookingsCount) * 100
      : todayBookingsCount > 0
        ? 100
        : 0;

  const todaySessions = sessions.filter((session) => session.date === demoToday && session.status !== 'cancelled');
  const bookingsBySession = indexBookingsBySession(bookings);

  let totalBooked = 0;
  let totalCapacity = 0;
  let todayAlmostFull = 0;
  for (const session of todaySessions) {
    const occupancy = selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []);
    totalBooked += occupancy.booked;
    totalCapacity += session.capacity;
    if (occupancy.occupancyState === 'almost_full') todayAlmostFull += 1;
  }

  return {
    activeMembers,
    activeMembersDelta,
    todayBookings: todayBookingsCount,
    todayBookingsDeltaPct,
    occupancyRate: totalCapacity > 0 ? totalBooked / totalCapacity : 0,
    todayClasses: todaySessions.length,
    todayAlmostFull,
  };
}
