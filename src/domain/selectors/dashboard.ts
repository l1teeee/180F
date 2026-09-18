// docs/08-STATE-MANAGEMENT.md section 4. activeMembers goes through selectActiveMembers,
// not customers.length, per ADR-016 (132 active out of 148 total customers).
import type { Booking, ClassSession, Customer, DashboardKpis, ISODate } from '@/domain/types';
import { addDaysISO } from '@/lib/dates';
import { indexBookingsBySession, selectBookingCountsByDate } from './bookings';
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

  // ADR-023: todayBookings is the exact same confirmed-or-pending-today count the weekly
  // chart's highlighted bar reads (selectWeeklyBookingTrend, bookings.ts) - one selector owns
  // the definition, so the KPI and the chart can never disagree.
  const yesterday = addDaysISO(demoToday, -1);
  const bookingCountsByDate = selectBookingCountsByDate(bookings, sessions);
  const todayBookingsCount = bookingCountsByDate.get(demoToday) ?? 0;
  const yesterdayBookingsCount = bookingCountsByDate.get(yesterday) ?? 0;
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
