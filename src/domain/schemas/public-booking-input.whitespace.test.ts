// docs/11-TEST-PLAN.md section 3, public booking form Zod schema: "accept valid input with
// surrounding whitespace trimmed". publicBookingInputSchema (src/domain/schemas/public-booking-input.ts)
// never calls .trim() on name/email/phone before validating, so this is currently unmet - see the
// defect notes on each test below. Marked with it.fails so a real fix (adding .trim() to those
// three fields in the schema) turns these green instead of the suite silently accepting untrimmed
// data.
import { describe, expect, it } from 'vitest';
import { publicBookingInputSchema } from './public-booking-input';

describe('publicBookingInputSchema whitespace handling', () => {
  // DEFECT: `email: z.email(...)` runs before any trim, and Zod's email regex does not tolerate
  // leading/trailing whitespace, so a valid email padded with spaces is rejected outright instead
  // of being accepted and cleaned up. Fix: `email: z.string().trim().pipe(z.email(...))` (or
  // equivalent) in public-booking-input.ts.
  it.fails('accepts an email with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: '  jo@example.com  ',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('jo@example.com');
  });

  // DEFECT: `name: z.string().min(2, ...)` has no .trim(), so a name padded with whitespace
  // parses successfully but the padding survives into result.data instead of being stripped.
  // Fix: `name: z.string().trim().min(2, ...)` in public-booking-input.ts.
  it.fails('accepts a name with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: '  Jo Martinez  ',
      email: 'jo@example.com',
      phone: '+57 300 000 0001',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Jo Martinez');
  });

  // DEFECT: the phone `.refine()` only checks digit count, it never transforms the value, so a
  // phone padded with whitespace parses successfully but keeps its padding in result.data.
  // Fix: `phone: z.string().trim().refine(...)` in public-booking-input.ts.
  it.fails('accepts a phone with surrounding whitespace and trims it', () => {
    const result = publicBookingInputSchema.safeParse({
      sessionId: 'ses-0001',
      name: 'Jo Martinez',
      email: 'jo@example.com',
      phone: '  +57 300 000 0001  ',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+57 300 000 0001');
  });
});
