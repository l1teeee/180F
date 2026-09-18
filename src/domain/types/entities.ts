// Persistable entities. Per ADR-006, entities hold only facts that would live in a
// real database row - volatile counters (booked, classesThisMonth, attendanceRate,
// lastVisit, weeklySessions) live on selector-produced view models instead (view-models.ts).
// docs/04-DOMAIN-MODEL.md section 2.

import type {
  AccentToken,
  AutomationChannel,
  AutomationStatus,
  AutomationTrigger,
  BillingPeriod,
  BookingSource,
  BookingStatus,
  ClassCategory,
  ClassIconName,
  CustomerStatus,
  InstructorStatus,
  ISODate,
  ISODateTime,
  NotificationType,
  SessionStatus,
  TimeOfDay,
} from './primitives';

export interface Organization {
  id: string;
  name: string; // '180 Fitness Studio'
  logo: string | null; // null -> initials placeholder
  timezone: string; // 'America/Bogota'
  address: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string; // 'cus-0001'
  name: string; // 'Customer 01'  (privacy rule, master plan section 9)
  email: string; // 'customer01@demo.180fitness.app'
  phone: string; // '+57 300 000 0001'
  avatar: string | null; // null -> initials avatar
  status: CustomerStatus;
  membershipId: string; // -> MembershipPlan.id
  joinedAt: ISODate;
}

export interface Instructor {
  id: string; // 'ins-01'
  name: string; // 'Instructor 01'
  avatar: string | null;
  specialty: string; // 'Functional Training'
  rating: number; // 4.0 - 5.0, one decimal; the seed uses 4.5 - 4.9
  status: InstructorStatus;
  bio: string;
}

export interface ClassType {
  id: string; // 'ct-functional-training'
  name: string;
  description: string;
  durationMinutes: number;
  defaultCapacity: number;
  category: ClassCategory;
  accent: AccentToken;
  icon: ClassIconName; // closed union, indexes the icon map with no cast (Codex L1)
}

// ClassSession carries no `booked` field - occupancy is derived, never stored, so it can
// never drift from the booking ledger (ADR-006). See SessionWithOccupancy in view-models.ts.
export interface ClassSession {
  id: string; // 'ses-0001'
  classTypeId: string;
  instructorId: string;
  date: ISODate;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  capacity: number;
  room: string; // 'Studio A' | 'Studio B' | 'Cycle Room' | 'Mat Room'
  status: SessionStatus;
}

export interface Booking {
  id: string; // 'bkg-0001'
  customerId: string;
  sessionId: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: ISODateTime;
  checkedInAt: ISODateTime | null;
  cancelledAt: ISODateTime | null; // non-null exactly when status === 'cancelled' (Codex M5, invariant 7)
}

export interface MembershipPlan {
  id: string; // 'plan-basic'
  name: string;
  monthlyPrice: number; // 29 | 49 | 69 | 8
  billingPeriod: BillingPeriod;
  classLimit: number | null; // null = unlimited
  benefits: string[];
  accent: AccentToken;
}

export interface Automation {
  id: string; // 'auto-01'
  name: string;
  channel: AutomationChannel;
  trigger: AutomationTrigger;
  status: AutomationStatus;
  description: string;
  messageTemplate: string; // rendered by the WhatsApp preview, master plan section 33
}

export interface Notification {
  id: string; // 'ntf-01'
  type: NotificationType;
  title: string;
  description: string;
  createdAt: ISODateTime;
  read: boolean;
}

export interface StudioSettings {
  general: {
    studioName: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
  };
  booking: {
    cancellationWindowHours: number; // 12
    maxReservationsPerDay: number; // 2
    waitlistEnabled: boolean; // true
    advanceBookingDays: number; // 14
  };
  notifications: {
    whatsappConfirmations: boolean;
    emailConfirmations: boolean;
    reminderHoursBefore: number; // 24
  };
  branding: {
    logo: string | null;
    primaryColor: string; // '#7869D4'
    accentColor: string; // '#F5D889'
  };
}
