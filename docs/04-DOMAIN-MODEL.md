# 04 — Domain Model

The contract every agent implements against. Files live in `src/domain/types/`. Sonnet may add fields only with Opus approval (§0.2).

Per ADR-006, entities hold persistable facts only; volatile counters live on view models produced by selectors. Section 5 maps every field listed in master plan §8 to where it now lives, so nothing is lost.

---

## 1. Primitives and unions

```ts
// src/domain/types/primitives.ts
export type ISODate = string;      // 'YYYY-MM-DD'
export type ISODateTime = string;  // '2026-09-17T18:00:00.000-05:00' (studio-local offset, never UTC)
export type TimeOfDay = string;    // 'HH:mm', 24-hour

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'waitlist';
export type BookingSource = 'website' | 'whatsapp' | 'instagram' | 'reception';
export type CustomerStatus = 'active' | 'inactive' | 'paused';
export type InstructorStatus = 'available' | 'in_class' | 'off_today';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type OccupancyState = 'available' | 'almost_full' | 'full';
export type ClassCategory = 'strength' | 'cardio' | 'mind_body' | 'combat';
export type AccentToken = 'purple' | 'yellow' | 'green' | 'pink' | 'blue';
export type AutomationChannel = 'whatsapp' | 'email' | 'sms';
export type AutomationStatus = 'active' | 'paused' | 'draft';
export type AutomationTrigger =
  | 'booking_created'
  | 'session_24h_before'
  | 'customer_inactive_30d'
  | 'customer_birthday';
export type NotificationType =
  | 'booking_created'
  | 'booking_cancelled'
  | 'session_full'
  | 'membership_renewed'
  | 'waitlist_promoted';
// Every kind below is derivable from a fact the ledger actually stores.
// 'membership_renewed' was removed: no renewal event exists in the demo data (Codex M5).
export type ActivityKind =
  | 'joined'
  | 'attended'
  | 'reserved'
  | 'cancelled'
  | 'no_show';
export type BillingPeriod = 'monthly' | 'one_time';

// Closed set: a bare `string` cannot index the icon map under strict TypeScript
// without an assertion (Codex L1).
export type ClassIconName =
  | 'Dumbbell' | 'Bike' | 'Flower2' | 'Anchor'
  | 'Flame' | 'Weight' | 'StretchHorizontal' | 'Swords';
```

`SessionStatus`, `OccupancyState`, `ClassCategory`, `AccentToken`, `AutomationChannel`, `AutomationStatus`, `AutomationTrigger`, `NotificationType`, `ActivityKind` and `BillingPeriod` are additions to §8's list; they replace free-form strings the master plan implies in §22, §26, §31, §32 and §42. No other union may be introduced without an ADR.

---

## 2. Entities

```ts
// src/domain/types/entities.ts
// Seed-time identity only. `useSettingsStore.general` is the live owner of studio
// name, email, phone, address and timezone once hydration completes (ADR-019);
// every screen reads the settings store, never this record.
export interface Organization {
  id: string;
  name: string;            // '180 Fitness Studio'
  logo: string | null;     // null -> initials placeholder
  timezone: string;        // 'America/Bogota'
  address: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string;              // 'cus-0001'
  name: string;            // 'Customer 01'  (privacy rule, §9)
  email: string;           // 'customer01@demo.180fitness.app'
  phone: string;           // '+57 300 000 0001'
  avatar: string | null;   // null -> initials avatar
  status: CustomerStatus;
  membershipId: string;    // -> MembershipPlan.id
  joinedAt: ISODate;
}

export interface Instructor {
  id: string;              // 'ins-01'
  name: string;            // 'Instructor 01'
  avatar: string | null;
  specialty: string;       // 'Functional Training'
  rating: number;          // 4.0 - 5.0, one decimal; the seed uses 4.5 - 4.9
  status: InstructorStatus;
  bio: string;
}

export interface ClassType {
  id: string;              // 'ct-functional-training'
  name: string;
  description: string;
  durationMinutes: number;
  defaultCapacity: number;
  category: ClassCategory;
  accent: AccentToken;
  icon: ClassIconName;     // closed union, indexes the icon map with no cast
}

export interface ClassSession {
  id: string;              // 'ses-0001'
  classTypeId: string;
  instructorId: string;
  date: ISODate;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  capacity: number;
  room: string;            // 'Studio A' | 'Studio B' | 'Cycle Room' | 'Mat Room'
  status: SessionStatus;
}

export interface Booking {
  id: string;              // 'bkg-0001'
  customerId: string;
  sessionId: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: ISODateTime;
  checkedInAt: ISODateTime | null;
  cancelledAt: ISODateTime | null;  // required by the activity timeline (Codex M5)
}

export interface MembershipPlan {
  id: string;              // 'plan-basic'
  name: string;
  monthlyPrice: number;    // 29 | 49 | 69 | 8
  billingPeriod: BillingPeriod;
  classLimit: number | null; // null = unlimited
  benefits: string[];
  accent: AccentToken;
}

export interface Automation {
  id: string;              // 'auto-01'
  name: string;
  channel: AutomationChannel;
  trigger: AutomationTrigger;
  status: AutomationStatus;
  description: string;
  messageTemplate: string; // rendered by the WhatsApp preview, §33
}

export interface Notification {
  id: string;              // 'ntf-01'
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
    cancellationWindowHours: number;   // 12
    maxReservationsPerDay: number;     // 2
    waitlistEnabled: boolean;          // true
    advanceBookingDays: number;        // 14
  };
  notifications: {
    whatsappConfirmations: boolean;
    emailConfirmations: boolean;
    reminderHoursBefore: number;       // 24
  };
  branding: {
    logo: string | null;
    primaryColor: string;              // '#7869D4'
    accentColor: string;               // '#F5D889'
  };
}
```

`ClassSession.booked` is intentionally absent — see ADR-006 and `SessionWithOccupancy` below.

---

## 3. View models (selector output)

```ts
// src/domain/types/view-models.ts
export interface SessionWithOccupancy extends ClassSession {
  booked: number;            // confirmed + pending (ADR-008)
  available: number;
  occupancyRate: number;     // 0..1
  occupancyState: OccupancyState;
  waitlistCount: number;
}

export interface SessionCard extends SessionWithOccupancy {
  classType: ClassType;
  instructor: Instructor;
}

export interface CustomerWithStats extends Customer {
  lastVisit: ISODate | null;
  classesThisMonth: number;
  attendanceRate: number;    // 0..100, rounded
  noShows: number;
  favoriteClassTypeId: string | null;
  membership: MembershipPlan;
  remainingCredits: number | null;  // null when the plan is unlimited
}

export interface InstructorWithStats extends Instructor {
  weeklySessions: number;
  classesThisMonth: number;
  reservations: number;
  occupancyRate: number;     // 0..1 across their sessions
}

export interface ClassTypeWithStats extends ClassType {
  weeklySessions: number;
  averageOccupancy: number;  // 0..1
  bookingsThisMonth: number;
  cancellationRate: number;  // 0..1
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
  className: string | null;  // structured operand; null only for 'joined'. i18n phase 1: `label`
                              // (a fixed English sentence) was dropped for the same reason
                              // WeeklyBookingPoint.label was - the domain layer may not pick a
                              // locale. activity-timeline.tsx assembles the sentence from
                              // `kind` + `className` through the dictionary.
  at: ISODateTime;
  sessionId: string | null;
}

export interface DashboardKpis {
  activeMembers: number;
  activeMembersDelta: number;      // joined this month
  todayBookings: number;
  todayBookingsDeltaPct: number;   // vs yesterday
  occupancyRate: number;           // 0..1, today's sessions
  todayClasses: number;
  todayAlmostFull: number;
}

export interface WeeklyBookingPoint {
  date: ISODate;
  bookings: number;
}
// `label` (a formatted weekday name) was dropped in the i18n phase 1 pass: producing it inside
// the selector forced the domain layer to pick a locale, which breaks section 1's dependency
// rule. Consumers derive the weekday label from `date` in the active language instead
// (src/hooks/use-date-locale.ts).

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
```

---

## 4. Input types

```ts
// src/domain/types/inputs.ts
export interface NewBookingInput {
  customerId: string;
  sessionId: string;
  source: BookingSource;
  status?: Extract<BookingStatus, 'confirmed' | 'pending' | 'waitlist'>;
}

export interface PublicBookingInput {
  sessionId: string;
  name: string;
  email: string;
  phone: string;
}

// A public booking may have to create the customer. Identity is resolved by
// lowercased, trimmed email: an existing customer is reused, never duplicated
// (Codex M2, M3).
export interface NewCustomerInput {
  name: string;
  email: string;
  phone: string;
  membershipId?: string;   // defaults to PUBLIC_DEFAULT_PLAN_ID = 'plan-day-pass'
}

// The outcome of an eligibility check, shared by the UI and every store action
// so a disabled control and a rejected action always agree (Codex M4).
export type BookingEligibility =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | 'session_not_found'
        | 'session_cancelled'
        | 'session_started'
        | 'session_full'
        | 'already_booked'
        | 'daily_limit_reached'
        | 'outside_booking_window'
        | 'waitlist_disabled'
        | 'waitlist_not_available';  // a waitlist request on a session that is not full
      message: string;
    };

export type BookingFilters = {
  query: string;
  status: BookingStatus | 'all';
  source: BookingSource | 'all';
  date: ISODate | null;
};

export type CustomerFilters = {
  query: string;
  status: CustomerStatus | 'all';
  membershipId: string | 'all';
};
```

Zod schemas mirroring `NewBookingInput`, `PublicBookingInput` and `StudioSettings` sections live in `src/domain/schemas/` and are the only validation source for forms.

---

## 5. Master-plan field mapping

| §8 field | Lives on | Produced by |
|---|---|---|
| `ClassSession.booked` | `SessionWithOccupancy.booked` | `selectSessionOccupancy` |
| `Customer.lastVisit` | `CustomerWithStats.lastVisit` | `selectCustomerStats` |
| `Customer.classesThisMonth` | `CustomerWithStats.classesThisMonth` | `selectCustomerStats` |
| `Customer.attendanceRate` | `CustomerWithStats.attendanceRate` | `selectCustomerStats` |
| `Instructor.weeklySessions` | `InstructorWithStats.weeklySessions` | `selectInstructorStats` |
| everything else in §8 | unchanged on the entity | seed data |

---

## 6. Identifier conventions

| Entity | Pattern | Example |
|---|---|---|
| Customer | `cus-NNNN` | `cus-0042` |
| Instructor | `ins-NN` | `ins-03` |
| Class type | `ct-<slug>` | `ct-functional-training` |
| Session | `ses-NNNN` | `ses-0117` |
| Booking | `bkg-NNNNN` | `bkg-00731` |
| Membership plan | `plan-<slug>` | `plan-unlimited` |
| Automation | `auto-NN` | `auto-01` |
| Notification | `ntf-NN` | `ntf-07` |

Runtime-created bookings use `bkg-live-<n>` so demo-created records are distinguishable in review without changing any rendering.

---

## 7. Invariants

1. Every `Booking.customerId` resolves to a `Customer`; every `Booking.sessionId` resolves to a `ClassSession`.
2. `booked <= capacity` for every session at all times, including after a live booking.
3. A customer has at most one non-cancelled booking per session.
4. `checkedInAt` is non-null only for bookings whose session is in the past and whose status is `confirmed`.
5. A waitlist booking may only be **created** while the session is full. It legitimately survives a later cancellation that frees a spot, until someone promotes it; promotion mutates that same booking to `confirmed` after a fresh capacity check (Codex H4).
6. `booked <= capacity` holds even under concurrent creates, because capacity is re-checked at commit time inside the same synchronous state update (ADR-017).
7. `cancelledAt` is non-null exactly when `status === 'cancelled'`.
8. All dates are studio-local wall-clock strings; no timezone conversion happens anywhere in the demo.

Every invariant above is asserted by unit tests over the generated dataset, for **all seven** possible weekday anchors, not just one (Codex H1).
