// Form and mutation input contracts. Zod schemas mirroring these live in domain/schemas
// and are the only validation source for forms (docs/04-DOMAIN-MODEL.md section 4).

import type { BookingSource, BookingStatus, CustomerStatus, ISODate } from './primitives';

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

// A public booking may have to create the customer. Identity is resolved by lowercased,
// trimmed email: an existing customer is reused, never duplicated (Codex M2, M3, amendment A3).
// `membershipId` defaults to PUBLIC_DEFAULT_PLAN_ID ('plan-day-pass') when omitted.
export interface NewCustomerInput {
  name: string;
  email: string;
  phone: string;
  membershipId?: string;
}

// The outcome of an eligibility check, shared by the UI and every store action so a disabled
// control and a rejected action always agree (Codex M4, docs/08-STATE-MANAGEMENT.md section
// 8.3). 'waitlist_not_available' is Phase 2C's addition to the documented union (invariant 5:
// a waitlist booking may only be created while the session is full) - correct, and kept.
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
        | 'waitlist_not_available';
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
