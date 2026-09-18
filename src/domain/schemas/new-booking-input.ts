// Mirrors domain/types/inputs.ts NewBookingInput (docs/04-DOMAIN-MODEL.md section 4).
// The only validation source for the admin booking form (Phase 4).
import { z } from 'zod';

export const newBookingInputSchema = z.object({
  customerId: z.string().min(1),
  sessionId: z.string().min(1),
  source: z.enum(['website', 'whatsapp', 'instagram', 'reception']),
  status: z.enum(['confirmed', 'pending', 'waitlist']).optional(),
});

export type NewBookingInputSchema = z.infer<typeof newBookingInputSchema>;
