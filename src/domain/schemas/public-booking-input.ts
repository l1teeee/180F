// Mirrors domain/types/inputs.ts PublicBookingInput (docs/04-DOMAIN-MODEL.md section 4).
// The only validation source for the public /book wizard's customer-details step (Phase 8).
import { z } from 'zod';

export const publicBookingInputSchema = z.object({
  sessionId: z.string().min(1),
  name: z.string().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email address'),
  // A phone field accepts spaces/dashes/parens for readability, so the digit count is
  // what is validated, not the raw string length.
  phone: z.string().refine((value) => value.replace(/\D/g, '').length >= 7, {
    message: 'Enter a phone number with at least 7 digits',
  }),
});

export type PublicBookingInputSchema = z.infer<typeof publicBookingInputSchema>;
