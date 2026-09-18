// docs/07-COMPONENT-ARCHITECTURE.md section 4: renders CustomerActivityEntry[] (master plan
// section 26). `demoNow` is one field beyond that document's literal `{ entries }` prop shape -
// without it a relative "how long ago" label (required by this phase's brief: "each with a real
// timestamp relative to demoNow") cannot be computed from a presentational component with no
// store access of its own. Purely presentational otherwise, so no 'use client' directive.
import { CalendarClock, CircleAlert, CircleCheck, CircleX, LogIn, type LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import type { ActivityKind, CustomerActivityEntry, ISODateTime } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDisplayDate } from '@/lib/dates';

export interface ActivityTimelineProps {
  entries: CustomerActivityEntry[];
  demoNow: ISODateTime;
}

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  joined: LogIn,
  attended: CircleCheck,
  reserved: CalendarClock,
  cancelled: CircleX,
  no_show: CircleAlert,
};

// Local kind->tint map, same convention as shared/occupancy-bar.tsx's own accent-classname map -
// ActivityKind is not one of the five unions status-styles.ts covers, so this is not a second
// status->colour map for an already-covered status (docs/07 section 7 anti-pattern).
const KIND_CLASSNAME: Record<ActivityKind, string> = {
  joined: 'bg-blue-soft text-blue-text',
  attended: 'bg-green-soft text-green-text',
  reserved: 'bg-purple-xsoft text-purple-deep',
  cancelled: 'bg-danger-soft text-danger-text',
  no_show: 'bg-yellow-soft text-yellow-text',
};

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Every entry's `at` is <= demoNow (activity is never seeded in the future), but the floor at 0
// keeps a same-instant entry reading "Just now" instead of a stray negative duration.
function formatRelative(at: ISODateTime, demoNow: ISODateTime): string {
  const diffMs = Math.max(0, new Date(demoNow).getTime() - new Date(at).getTime());
  if (diffMs < MINUTE_MS) return 'Just now';
  if (diffMs < HOUR_MS) return `${Math.floor(diffMs / MINUTE_MS)}m ago`;
  if (diffMs < DAY_MS) return `${Math.floor(diffMs / HOUR_MS)}h ago`;
  if (diffMs < 7 * DAY_MS) return `${Math.floor(diffMs / DAY_MS)}d ago`;
  return formatDisplayDate(at.slice(0, 10));
}

export function ActivityTimeline({ entries, demoNow }: ActivityTimelineProps) {
  if (entries.length === 0) {
    return <EmptyState title="No activity yet" />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => {
        const Icon = KIND_ICON[entry.kind];
        return (
          <li key={entry.id} className="flex items-center gap-3">
            <span aria-hidden="true" className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-chip', KIND_CLASSNAME[entry.kind])}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm text-ink">{entry.label}</span>
            <span className="shrink-0 text-xs text-text-tertiary tabular-nums">{formatRelative(entry.at, demoNow)}</span>
          </li>
        );
      })}
    </ul>
  );
}
