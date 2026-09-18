import { describe, expect, it } from 'vitest';
import { newBookingInputSchema } from './new-booking-input';

describe('newBookingInputSchema', () => {
  it('parses a valid input', () => {
    const result = newBookingInputSchema.safeParse({
      customerId: 'cus-0001',
      sessionId: 'ses-0001',
      source: 'website',
    });
    expect(result.success).toBe(true);
  });

  it('accepts the optional status when present', () => {
    const result = newBookingInputSchema.safeParse({
      customerId: 'cus-0001',
      sessionId: 'ses-0001',
      source: 'reception',
      status: 'pending',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing customerId', () => {
    const result = newBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      source: 'website',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing sessionId', () => {
    const result = newBookingInputSchema.safeParse({
      customerId: 'cus-0001',
      source: 'website',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid source', () => {
    const result = newBookingInputSchema.safeParse({
      customerId: 'cus-0001',
      sessionId: 'ses-0001',
      source: 'carrier-pigeon',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a status value that is not confirmed/pending/waitlist', () => {
    const result = newBookingInputSchema.safeParse({
      customerId: 'cus-0001',
      sessionId: 'ses-0001',
      source: 'website',
      status: 'cancelled',
    });
    expect(result.success).toBe(false);
  });
});
