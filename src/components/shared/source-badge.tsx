// docs/07-COMPONENT-ARCHITECTURE.md section 4. Mirrors status-badge.tsx exactly, but reads the
// one BookingSource->style map (src/domain/constants/booking-source.ts) instead of a status map
// - kept as its own component/file per docs/02-ARCHITECTURE.md section 2 ("status labels, source
// labels" are distinct constant groups, so they get distinct badges too).
import { ACCENT_BADGE_VARIANT } from './status-badge';
import { Badge } from '@/components/ui/badge';
import { BOOKING_SOURCE_STYLE } from '@/domain/constants';
import type { BookingSource } from '@/domain/types';

export interface SourceBadgeProps {
  source: BookingSource;
  label?: string; // override the default label from BOOKING_SOURCE_STYLE, e.g. a translated one
}

export function SourceBadge({ source, label }: SourceBadgeProps) {
  const style = BOOKING_SOURCE_STYLE[source];
  return <Badge variant={ACCENT_BADGE_VARIANT[style.accent]}>{label ?? style.label}</Badge>;
}
