// Mirrors domain/types/inputs.ts PublicBookingInput (docs/04-DOMAIN-MODEL.md section 4).
// The only validation source for the public /book wizard's customer-details step (Phase 8).
import { z } from 'zod';

export const publicBookingInputSchema = z.object({
  sessionId: z.string().min(1),
  // .trim() runs before the length check on every field below, so padded-but-valid input (a
  // common paste or mobile-keyboard artefact) is accepted and cleaned, while whitespace-only
  // input trims down to an empty string and correctly fails that same check instead of
  // slipping through as a "valid" blank name/phone.
  name: z.string().trim().min(2, 'Enter your full name'),
  // z.email() bakes its format check in at construction, so trimming has to happen in a
  // separate string stage piped into it - trimming after (z.email().trim()) would validate the
  // untrimmed value first and reject valid-but-padded input instead of cleaning it up.
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  // A phone field accepts spaces/dashes/parens for readability, so the digit count is
  // what is validated, not the raw string length.
  phone: z.string().trim().refine((value) => value.replace(/\D/g, '').length >= 7, {
    message: 'Enter a phone number with at least 7 digits',
  }),
});

export type PublicBookingInputSchema = z.infer<typeof publicBookingInputSchema>;
