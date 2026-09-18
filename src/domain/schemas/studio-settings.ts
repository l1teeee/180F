// Mirrors domain/types/entities.ts StudioSettings, one schema per section plus the
// combined shape (docs/04-DOMAIN-MODEL.md section 4). The only validation source for the
// /settings form sections (Phase 9).
import { z } from 'zod';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const generalSettingsSchema = z.object({
  studioName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  timezone: z.string().min(1),
});

export const bookingSettingsSchema = z.object({
  cancellationWindowHours: z.number().int().nonnegative(),
  maxReservationsPerDay: z.number().int().positive(),
  waitlistEnabled: z.boolean(),
  advanceBookingDays: z.number().int().positive(),
});

export const notificationsSettingsSchema = z.object({
  whatsappConfirmations: z.boolean(),
  emailConfirmations: z.boolean(),
  reminderHoursBefore: z.number().int().nonnegative(),
});

export const brandingSettingsSchema = z.object({
  logo: z.string().nullable(),
  primaryColor: z.string().regex(HEX_COLOR_PATTERN, 'Must be a hex colour like #7869D4'),
  accentColor: z.string().regex(HEX_COLOR_PATTERN, 'Must be a hex colour like #7869D4'),
});

export const studioSettingsSchema = z.object({
  general: generalSettingsSchema,
  booking: bookingSettingsSchema,
  notifications: notificationsSettingsSchema,
  branding: brandingSettingsSchema,
});

export type StudioSettingsSchema = z.infer<typeof studioSettingsSchema>;
