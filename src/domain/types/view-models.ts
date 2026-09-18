// Selector output shapes. Every volatile counter named in master plan section 8 lives on one
// of these, never on the entity it decorates (ADR-006). docs/04-DOMAIN-MODEL.md section 3.

import type { AccentToken, ActivityKind, ISODate, ISODateTime, OccupancyState } from './primitives';
import type { ClassType, Customer, Instructor, ClassSession, Booking, MembershipPlan } from './entities';

export interface SessionWithOccupancy extends ClassSession {
  booked: number; // confirmed + pending (ADR-008)
  available: number;
  occupancyRate: number; // 0..1, clamped for display - see `overbooked` for the raw comparison
  occupancyState: OccupancyState;
  waitlistCount: number;
  overbooked: boolean; // booked > capacity (e.g. capacity edited below the booking count)
}

export interface SessionCard extends SessionWithOccupancy {
  classType: ClassType;
  instructor: Instructor;
}

export interface CustomerWithStats extends Customer {
  lastVisit: ISODate | null;
  classesThisMonth: number;
  attendanceRate: number; // 0..100, rounded
  noShows: number;
  favoriteClassTypeId: string | null;
  membership: MembershipPlan;
  remainingCredits: number | null; // null when the plan is unlimited
}

export interface InstructorWithStats extends Instructor {
  weeklySessions: number;
  classesThisMonth: number;
  reservations: number;
  occupancyRate: number; // 0..1 across their sessions
}

export interface ClassTypeWithStats extends ClassType {
  weeklySessions: number;
  averageOccupancy: number; // 0..1
  bookingsThisMonth: number;
  cancellationRate: number; // 0..1
  instructorIds: string[];
}

export interface BookingRow extends Booking {
  customer: Customer;
  session: ClassSession;
  classType: ClassType;
  instructor: Instructor;
}

export interface CustomerActivityEntry {
  id: string;
  kind: ActivityKind;
  // The class name this entry is about - absent for 'joined', which names no class. A
  // component builds the sentence from `kind` + `className` through the dictionary (the
  // domain layer never picks a locale - docs/02-ARCHITECTURE.md section 1). `label` was
  // dropped from this view model for the same reason WeeklyBookingPoint.label was: emitting a
  // fixed English sentence here would keep the customer activity timeline in English forever.
  className: string | null;
  at: ISODateTime;
  sessionId: string | null;
}

export interface DashboardKpis {
  activeMembers: number;
  activeMembersDelta: number; // joined this month
  todayBookings: number;
  todayBookingsDeltaPct: number; // vs yesterday
  occupancyRate: number; // 0..1, today's sessions
  todayClasses: number;
  todayAlmostFull: number;
}

// `label` (a formatted weekday name) was dropped from this view model: producing it inside the
// selector meant the domain layer had to pick a locale, which breaks the dependency rule (domain
// never imports UI/i18n - docs/02-ARCHITECTURE.md section 1). Consumers derive the weekday label
// from `date` themselves, in the active language (src/hooks/use-date-locale.ts).
export interface WeeklyBookingPoint {
  date: ISODate;
  bookings: number;
}

export interface ClassOccupancyPoint {
  classTypeId: string;
  name: string;
  accent: AccentToken;
  occupancyRate: number;
}

export interface SearchResult {
  id: string;
  kind: 'customer' | 'class' | 'instructor';
  label: string;
  sublabel: string;
  href: string;
}
