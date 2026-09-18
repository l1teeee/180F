// docs/07-COMPONENT-ARCHITECTURE.md section 4. The single consumer of the five status-style
// maps in src/domain/constants/status-styles.ts (docs/07 section 7: a second status->colour
// map anywhere else is a review failure) - this file only converts an already-resolved
// {label, accent} pair into a Badge, it never decides what accent a status gets.
import { CircleCheck, CircleX, Clock, Hourglass, Info, type LucideIcon } from 'lucide-react';
import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import {
  AUTOMATION_STATUS_STYLE,
  BOOKING_STATUS_STYLE,
  CUSTOMER_STATUS_STYLE,
  INSTRUCTOR_STATUS_STYLE,
  OCCUPANCY_STATE_STYLE,
  type StatusStyle,
} from '@/domain/constants';
import type {
  AccentToken,
  AutomationStatus,
  BookingStatus,
  CustomerStatus,
  InstructorStatus,
  OccupancyState,
} from '@/domain/types';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

// AccentToken -> Badge variant. Not a status->colour map (that's status-styles.ts); this only
// carries an already-chosen accent token into the Badge primitive's own variant vocabulary.
export const ACCENT_BADGE_VARIANT: Record<AccentToken, BadgeVariant> = {
  green: 'positive',
  yellow: 'pending',
  pink: 'danger',
  purple: 'neutralBrand',
  blue: 'info',
};

// One default icon per accent/tone, reused verbatim from the design-system preview's Pill
// component (src/app/design-system/_components/pill.tsx) - "status is always icon-or-shape
// plus text, never colour alone" (docs/03 section 10), satisfied per-tone rather than
// per-status-value, exactly as that reference established.
const ACCENT_ICON: Record<AccentToken, LucideIcon> = {
  green: CircleCheck,
  yellow: Clock,
  pink: CircleX,
  purple: Hourglass,
  blue: Info,
};

// Some status values repeat across unions ('active' in CustomerStatus and AutomationStatus,
// 'available' in InstructorStatus and OccupancyState, 'paused' in CustomerStatus and
// AutomationStatus) - every overlapping key resolves to the identical {label, accent} pair in
// every map it appears in, so merging is safe and the lookup does not need to know which union
// a given value came from.
const STATUS_STYLE_MAP: Record<
  BookingStatus | CustomerStatus | InstructorStatus | AutomationStatus | OccupancyState,
  StatusStyle
> = {
  ...BOOKING_STATUS_STYLE,
  ...CUSTOMER_STATUS_STYLE,
  ...INSTRUCTOR_STATUS_STYLE,
  ...AUTOMATION_STATUS_STYLE,
  ...OCCUPANCY_STATE_STYLE,
};

export interface StatusBadgeProps {
  status: BookingStatus | CustomerStatus | InstructorStatus | AutomationStatus | OccupancyState;
  label?: string; // override the default label from the status->colour map
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = STATUS_STYLE_MAP[status];
  const Icon = ACCENT_ICON[style.accent];
  return (
    <Badge variant={ACCENT_BADGE_VARIANT[style.accent]}>
      <Icon aria-hidden="true" />
      {label ?? style.label}
    </Badge>
  );
}
