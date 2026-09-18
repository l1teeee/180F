// Pure selectors over customers - docs/08-STATE-MANAGEMENT.md section 4.
import type {
  Booking,
  ClassSession,
  ClassType,
  Customer,
  CustomerActivityEntry,
  CustomerFilters,
  CustomerWithStats,
  ISODate,
  MembershipPlan,
} from '@/domain/types';
import { buildISODateTime, isSameISOMonth } from '@/lib/dates';

export function selectActiveMembers(customers: Customer[]): number {
  return customers.filter((customer) => customer.status === 'active').length;
}

export function selectNewThisMonth(customers: Customer[], demoToday: ISODate): number {
  return customers.filter((customer) => isSameISOMonth(customer.joinedAt, demoToday)).length;
}

// attendanceRate = attended / (attended + no-show) over this customer's completed-session
// bookings, rounded to a whole percent; 0 (not NaN) when there are none yet.
export function selectCustomerStats(
  customer: Customer,
  bookings: Booking[],
  sessions: ClassSession[],
  membershipPlans: MembershipPlan[],
  demoToday: ISODate,
): CustomerWithStats {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const customerBookings = bookings.filter((booking) => booking.customerId === customer.id);

  let lastVisit: ISODate | null = null;
  let classesThisMonth = 0;
  let attended = 0;
  let noShows = 0;
  const classTypeCounts = new Map<string, number>();

  for (const booking of customerBookings) {
    const session = sessionById.get(booking.sessionId);
    if (!session) continue;

    if (booking.status !== 'cancelled') {
      classTypeCounts.set(session.classTypeId, (classTypeCounts.get(session.classTypeId) ?? 0) + 1);
      if (isSameISOMonth(session.date, demoToday)) classesThisMonth += 1;
    }

    if (session.status === 'completed' && booking.status === 'confirmed') {
      if (booking.checkedInAt) {
        attended += 1;
        if (!lastVisit || session.date > lastVisit) lastVisit = session.date;
      } else {
        noShows += 1;
      }
    }
  }

  const attendanceRate = attended + noShows > 0 ? Math.round((attended / (attended + noShows)) * 100) : 0;

  let favoriteClassTypeId: string | null = null;
  let favoriteCount = 0;
  for (const [classTypeId, count] of classTypeCounts) {
    if (count > favoriteCount) {
      favoriteCount = count;
      favoriteClassTypeId = classTypeId;
    }
  }

  const membership = membershipPlans.find((plan) => plan.id === customer.membershipId);
  if (!membership) {
    throw new Error(`selectCustomerStats: unknown membershipId "${customer.membershipId}" for customer "${customer.id}"`);
  }
  const remainingCredits = membership.classLimit === null ? null : Math.max(0, membership.classLimit - classesThisMonth);

  return {
    ...customer,
    lastVisit,
    classesThisMonth,
    attendanceRate,
    noShows,
    favoriteClassTypeId,
    membership,
    remainingCredits,
  };
}

export function selectCustomerActivity(
  customer: Customer,
  bookings: Booking[],
  sessions: ClassSession[],
  classTypes: ClassType[],
): CustomerActivityEntry[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const classTypeById = new Map(classTypes.map((classType) => [classType.id, classType]));
  const customerBookings = bookings.filter((booking) => booking.customerId === customer.id);

  const entries: CustomerActivityEntry[] = [
    {
      id: `${customer.id}-joined`,
      kind: 'joined',
      label: 'Joined 180 Fitness Studio',
      at: buildISODateTime(customer.joinedAt, '09:00'),
      sessionId: null,
    },
  ];

  for (const booking of customerBookings) {
    const session = sessionById.get(booking.sessionId);
    if (!session) continue;
    const className = classTypeById.get(session.classTypeId)?.name ?? 'class';

    if (booking.status === 'cancelled') {
      entries.push({
        id: `${booking.id}-cancelled`,
        kind: 'cancelled',
        label: `Cancelled ${className}`,
        // cancelledAt (invariant 7: non-null exactly when status === 'cancelled') is the fact
        // the ledger actually holds for "when this was cancelled" - createdAt is when the
        // booking was originally made, a different event (Codex M5).
        at: booking.cancelledAt ?? booking.createdAt,
        sessionId: session.id,
      });
      continue;
    }

    if (session.status === 'completed' && booking.status === 'confirmed') {
      if (booking.checkedInAt) {
        entries.push({
          id: `${booking.id}-attended`,
          kind: 'attended',
          label: `Attended ${className}`,
          at: booking.checkedInAt,
          sessionId: session.id,
        });
      } else {
        entries.push({
          id: `${booking.id}-no-show`,
          kind: 'no_show',
          label: `Missed ${className}`,
          at: buildISODateTime(session.date, session.startTime),
          sessionId: session.id,
        });
      }
      continue;
    }

    entries.push({
      id: `${booking.id}-reserved`,
      kind: 'reserved',
      label: `Reserved ${className}`,
      at: booking.createdAt,
      sessionId: session.id,
    });
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

export function filterCustomers(customers: Customer[], filters: CustomerFilters): Customer[] {
  const query = filters.query.trim().toLowerCase();
  return customers.filter((customer) => {
    if (filters.status !== 'all' && customer.status !== filters.status) return false;
    if (filters.membershipId !== 'all' && customer.membershipId !== filters.membershipId) return false;
    if (query && !customer.name.toLowerCase().includes(query)) return false;
    return true;
  });
}
