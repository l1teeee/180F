import { describe, expect, it } from 'vitest';
import { publicBookingInputSchema } from './public-booking-input';

describe('publicBookingInputSchema', () => {
  it('parses a valid input', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    for (const email of ['not-an-email', 'a@b']) {
      const result = publicBookingInputSchema.safeParse({
        sessionId: 'ses-0001',
        name: 'Jo Martinez',
        email,
        phone: '+57 300 000 0001',
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects a missing phone', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a phone with fewer than 7 digits', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '123-456',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a phone with punctuation as long as 7+ digits remain', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '(300) 000-0001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: '',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'A',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(false);
  });
});
