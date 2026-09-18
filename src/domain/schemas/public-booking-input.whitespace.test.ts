// docs/11-TEST-PLAN.md section 3, public booking form Zod schema: "accept valid input with
// surrounding whitespace trimmed". publicBookingInputSchema (src/domain/schemas/public-booking-input.ts)
// calls .trim() on name/email/phone before validating each, so all three below pass.
import { describe, expect, it } from 'vitest';
import { publicBookingInputSchema } from './public-booking-input';

describe('publicBookingInputSchema whitespace handling', () => {
  it('accepts an email with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: '  jo@example.com  ',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('jo@example.com');
  });

  it('accepts a name with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: '  Jo Martinez  ',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Jo Martinez');
  });

  it('accepts a phone with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '  +57 300 000 0001  ',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+57 300 000 0001');
  });

  // Codex: a whitespace-only name was reaching createPublicBooking and creating a customer and
  // a booking. Trimming first turns every whitespace-only field into an empty string, which
  // then fails the same check a genuinely empty field already failed - one fix, not a special
  // case per field.
  it('rejects a whitespace-only name instead of trimming it into a valid empty one', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: '   ',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only email', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: '   ',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only phone', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '   ',
    });
    expect(result.success).toBe(false);
  });
});
