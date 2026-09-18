// The full shape buildDemoDataset(demoToday) returns (docs/05-MOCK-DATA-STRATEGY.md section 10).
// Declared here rather than inline in src/data/seed.ts so every layer that needs to type
// against "the whole demo dataset" (stores in Phase 2C, tests here) imports one contract
// from domain/types instead of reaching into src/data for a type-only import.

import type { Automation, ClassType, Customer, Instructor, MembershipPlan, Notification, Organization, ClassSession, Booking, StudioSettings } from './entities';
import type { ISODate, ISODateTime } from './primitives';

export interface DemoDataset {
  organization: Organization;
  classTypes: ClassType[];
  instructors: Instructor[];
  membershipPlans: MembershipPlan[];
  customers: Customer[];
  sessions: ClassSession[];
  bookings: Booking[];
  automations: Automation[];
  notifications: Notification[];
  settings: StudioSettings;
  // ADR-018: the one demo clock. demoToday is the seed's external input; demoNow is the fixed
  // '09:00' studio-local anchor derived from it. Every relative label, "has this session
  // started" decision and FullCalendar's `now` reads demoNow, never the wall clock.
  demoToday: ISODate;
  demoNow: ISODateTime;
}
