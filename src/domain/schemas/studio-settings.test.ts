import { describe, expect, it } from 'vitest';
import {
  bookingSettingsSchema,
  brandingSettingsSchema,
  generalSettingsSchema,
  notificationsSettingsSchema,
  studioSettingsSchema,
} from './studio-settings';

describe('generalSettingsSchema', () => {
  it('parses a valid section', () => {
    const result = generalSettingsSchema.safeParse({
      studioName: '180 Fitness Studio',
      email: 'hello@180fitness.app',
      phone: '+57 601 000 0180',
      address: 'Carrera 11 # 93-45, Bogotá',
      timezone: 'America/Bogota',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = generalSettingsSchema.safeParse({
      studioName: '180 Fitness Studio',
      email: 'not-an-email',
      phone: '+57 601 000 0180',
      address: 'Carrera 11 # 93-45, Bogotá',
      timezone: 'America/Bogota',
    });
    expect(result.success).toBe(false);
  });
});

describe('bookingSettingsSchema', () => {
  it('parses a valid section', () => {
    const result = bookingSettingsSchema.safeParse({
      cancellationWindowHours: 12,
      maxReservationsPerDay: 2,
      waitlistEnabled: true,
      advanceBookingDays: 14,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-positive maxReservationsPerDay', () => {
    const result = bookingSettingsSchema.safeParse({
      cancellationWindowHours: 12,
      maxReservationsPerDay: 0,
      waitlistEnabled: true,
      advanceBookingDays: 14,
    });
    expect(result.success).toBe(false);
  });
});

describe('notificationsSettingsSchema', () => {
  it('parses a valid section', () => {
    const result = notificationsSettingsSchema.safeParse({
      whatsappConfirmations: true,
      emailConfirmations: false,
      reminderHoursBefore: 24,
    });
    expect(result.success).toBe(true);
  });
});

describe('brandingSettingsSchema', () => {
  it('parses a valid section including a null logo', () => {
    const result = brandingSettingsSchema.safeParse({
      logo: null,
      primaryColor: '#7869D4',
      accentColor: '#F5D889',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-hex colour', () => {
    const result = brandingSettingsSchema.safeParse({
      logo: null,
      primaryColor: 'purple',
      accentColor: '#F5D889',
    });
    expect(result.success).toBe(false);
  });
});

describe('studioSettingsSchema', () => {
  it('parses all four sections together', () => {
    const result = studioSettingsSchema.safeParse({
      general: {
        studioName: '180 Fitness Studio',
        email: 'hello@180fitness.app',
        phone: '+57 601 000 0180',
        address: 'Carrera 11 # 93-45, Bogotá',
        timezone: 'America/Bogota',
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
    });
    expect(result.success).toBe(true);
  });
});
