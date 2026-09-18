// Source labels/accents, kept separate from status-styles.ts because BookingSource is not a
// status union (docs/02-ARCHITECTURE.md section 2 lists "status labels, source labels" as
// distinct constant groups).
import type { BookingSource } from '@/domain/types';
import type { StatusStyle } from './status-styles';

export const BOOKING_SOURCE_STYLE: Record<BookingSource, StatusStyle> = {
  website: { label: 'Website', accent: 'purple' },
  whatsapp: { label: 'WhatsApp', accent: 'green' },
  instagram: { label: 'Instagram', accent: 'pink' },
  reception: { label: 'Reception', accent: 'blue' },
};
