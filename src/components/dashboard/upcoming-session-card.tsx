'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "UpcomingSessionCard": time, class, instructor,
// spots, status, avatar, mini occupancy indicator (master plan section 20).
//
// Renders the instructor avatar through the shared AvatarGroup (components/shared/avatar-group)
// with a single person, passing its optional per-person `accent` override so it takes the
// session's class-type accent (docs/03-DESIGN-SYSTEM.md section 13 "Tint") instead of
// AvatarGroup's default id-derived approximation.
import { AvatarGroup } from '@/components/shared/avatar-group';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import type { SessionCard } from '@/domain/types';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useMessages } from '@/hooks/use-messages';

export interface UpcomingSessionCardProps {
  session: SessionCard;
}

export function UpcomingSessionCard({ session }: UpcomingSessionCardProps) {
  const m = useMessages();
  const { formatDisplayTime, formatWeekdayShort } = useDateLocale();
  const { instructor, classType } = session;
  // overbooked (capacity edited below the booking count) must read explicitly, never hide
  // behind the clamped occupancyRate/occupancyState alone (standing rule for this phase) - the
  // badge label says so, and `booked` below is the raw, never-clamped ledger count against
  // capacity, so the discrepancy is visible in the numbers too.
  //
  // The label is always passed explicitly (never the StatusBadge default) because that default
  // comes from domain/constants/status-styles.ts, which is English-only and owned outside this
  // namespace (CLAUDE.md rule 6) - the accent still comes from occupancyState/status-styles.ts,
  // only the copy is looked up here.
  const statusLabel = session.overbooked ? m.dashboard.overbooked : m.dashboard.occupancyStateLabel[session.occupancyState];

  return (
    <div className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatWeekdayShort(session.date)} · {formatDisplayTime(session.startTime)}
        </span>
        <StatusBadge status={session.occupancyState} label={statusLabel} />
      </div>

      <div className="flex items-center gap-3">
        <AvatarGroup
          people={[{ id: instructor.id, name: instructor.name, avatar: instructor.avatar, accent: classType.accent }]}
          size={40}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-ink">{classType.name}</span>
          <span className="truncate text-sm text-text-secondary">{instructor.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <OccupancyBar rate={session.occupancyRate} accent={classType.accent} showPercentage={false} />
        <span className="shrink-0 text-sm text-text-secondary tabular-nums">
          <span className="font-semibold text-ink">{session.booked}</span>/{session.capacity} {m.dashboard.bookedLabel}
        </span>
      </div>
    </div>
  );
}
