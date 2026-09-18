// Primitives and unions - the base vocabulary every other domain type is built from.
// docs/04-DOMAIN-MODEL.md section 1. Adding or renaming a value here requires Opus approval.

export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string; // '2026-09-17T18:00:00.000-05:00' (studio-local offset, never UTC)
export type TimeOfDay = string; // 'HH:mm', 24-hour

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
// membership_renewed removed (Codex M5): no renewal event exists in the demo data, so
// nothing in the ledger can ever produce this kind truthfully.
export type ActivityKind =
  | 'joined'
  | 'attended'
  | 'reserved'
  | 'cancelled'
  | 'no_show';
export type BillingPeriod = 'monthly' | 'one_time';

// Closed set: a bare `string` cannot index the icon map under strict TypeScript without an
// assertion (Codex L1).
export type ClassIconName =
  | 'Dumbbell'
  | 'Bike'
  | 'Flower2'
  | 'Anchor'
  | 'Flame'
  | 'Weight'
  | 'StretchHorizontal'
  | 'Swords';
