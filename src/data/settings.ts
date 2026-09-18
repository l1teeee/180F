// Hand-authored - docs/05-MOCK-DATA-STRATEGY.md section 3.7. `general` is derived from
// organization.ts rather than re-typed, so studio contact details have one source.
import type { StudioSettings } from '@/domain/types';
import { organization } from './organization';

export const settings: StudioSettings = {
  general: {
    studioName: organization.name,
    email: organization.email,
    phone: organization.phone,
    address: organization.address,
    timezone: organization.timezone,
  },
  booking: {
    cancellationWindowHours: 12,
    maxReservationsPerDay: 2,
    waitlistEnabled: true,
    advanceBookingDays: 14,
  },
  notifications: {
    whatsappConfirmations: true,
    emailConfirmations: false,
    reminderHoursBefore: 24,
  },
  branding: {
    logo: null,
    primaryColor: '#7869D4',
    accentColor: '#F5D889',
  },
};
