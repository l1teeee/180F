// Shared join helper for useRecentBookings and useBookingRows (docs/08-STATE-MANAGEMENT.md
// section 8.8: "join tables through Map indexes built once per hook call" is hook-layer work,
// not a domain/selectors concern - domain/selectors produces BookingRow-shaped output nowhere
// today, so this lives alongside the two hooks that need it).
import type { Booking, BookingRow, ClassSession, ClassType, Customer, Instructor } from '@/domain/types';

export interface BookingRowLookups {
  customerById: Map<string, Customer>;
  sessionById: Map<string, ClassSession>;
  classTypeById: Map<string, ClassType>;
  instructorById: Map<string, Instructor>;
}

export function buildBookingRowLookups(
  customers: Customer[],
  sessions: ClassSession[],
  classTypes: ClassType[],
  instructors: Instructor[],
): BookingRowLookups {
  return {
    customerById: new Map(customers.map((customer) => [customer.id, customer])),
    sessionById: new Map(sessions.map((session) => [session.id, session])),
    classTypeById: new Map(classTypes.map((classType) => [classType.id, classType])),
    instructorById: new Map(instructors.map((instructor) => [instructor.id, instructor])),
  };
}

// Null for a booking whose session/customer/class type/instructor cannot be resolved. Per
// docs/04-DOMAIN-MODEL.md invariant 1 that should never happen, but this join sits inside a
// render, across four independently-selected store slices - defensively dropping the row is
// far cheaper than crashing the page over it, unlike a store mutation, which throws instead.
export function toBookingRow(booking: Booking, lookups: BookingRowLookups): BookingRow | null {
  const customer = lookups.customerById.get(booking.customerId);
  const session = lookups.sessionById.get(booking.sessionId);
  if (!customer || !session) return null;
  const classType = lookups.classTypeById.get(session.classTypeId);
  const instructor = lookups.instructorById.get(session.instructorId);
  if (!classType || !instructor) return null;
  return { ...booking, customer, session, classType, instructor };
}
