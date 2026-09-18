// The single status-to-style map for the app (docs/07-COMPONENT-ARCHITECTURE.md section 7
// anti-patterns: a second status-to-colour map anywhere else is a review failure). Each
// export is a Record over one of the status-like unions from domain/types/primitives.ts,
// pairing a display label with one of the five design-system accent tokens.

import type {
  AccentToken,
  AutomationStatus,
  BookingStatus,
  CustomerStatus,
  InstructorStatus,
  OccupancyState,
  SessionStatus,
} from '@/domain/types';

export interface StatusStyle {
  label: string;
  accent: AccentToken;
}

export const BOOKING_STATUS_STYLE: Record<BookingStatus, StatusStyle> = {
  confirmed: { label: 'Confirmed', accent: 'green' },
  pending: { label: 'Pending', accent: 'yellow' },
  cancelled: { label: 'Cancelled', accent: 'pink' },
  waitlist: { label: 'Waitlist', accent: 'blue' },
};

export const CUSTOMER_STATUS_STYLE: Record<CustomerStatus, StatusStyle> = {
  active: { label: 'Active', accent: 'green' },
  paused: { label: 'Paused', accent: 'yellow' },
  inactive: { label: 'Inactive', accent: 'blue' },
};

export const INSTRUCTOR_STATUS_STYLE: Record<InstructorStatus, StatusStyle> = {
  available: { label: 'Available', accent: 'green' },
  in_class: { label: 'In class', accent: 'purple' },
  off_today: { label: 'Off today', accent: 'blue' },
};

export const SESSION_STATUS_STYLE: Record<SessionStatus, StatusStyle> = {
  scheduled: { label: 'Scheduled', accent: 'purple' },
  completed: { label: 'Completed', accent: 'green' },
  cancelled: { label: 'Cancelled', accent: 'pink' },
};

export const OCCUPANCY_STATE_STYLE: Record<OccupancyState, StatusStyle> = {
  available: { label: 'Available', accent: 'green' },
  almost_full: { label: 'Almost full', accent: 'yellow' },
  full: { label: 'Full', accent: 'pink' },
};

export const AUTOMATION_STATUS_STYLE: Record<AutomationStatus, StatusStyle> = {
  active: { label: 'Active', accent: 'green' },
  paused: { label: 'Paused', accent: 'yellow' },
  draft: { label: 'Draft', accent: 'blue' },
};
