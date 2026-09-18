// docs/07-COMPONENT-ARCHITECTURE.md section 3 "UpcomingSessionCard": time, class, instructor,
// spots, status, avatar, mini occupancy indicator (master plan section 20).
//
// Renders the instructor avatar directly through AvatarBlobatar (components/ui/avatar.tsx)
// instead of the shared AvatarGroup: AvatarGroup's {id, name, avatar} contract has no accent
// override, so it always resolves an id-based customer-style accent (see that file's own
// comments) - it cannot express docs/03-DESIGN-SYSTEM.md section 13's rule that an instructor's
// avatar takes their class type's accent. This session already carries that exact classType, so
// this file builds the single-avatar variation locally per docs/12-AGENT-OWNERSHIP.md's
// feature-wave rule: never edit a shared component, compose or build the variation and report
// the gap (reported in the phase 3 handoff).
import { AvatarBlobatar } from '@/components/ui/avatar';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import type { AccentToken, SessionCard } from '@/domain/types';
import { formatDisplayTime, formatWeekdayShort } from '@/lib/dates';
import { paletteForAccent } from '@/lib/avatar';

export interface UpcomingSessionCardProps {
  session: SessionCard;
}

// Every seeded instructor is named "Instructor NN" (privacy rule, docs/04 section 2) - same
// trailing-number convention src/components/shared/avatar-group.tsx's initialsFor uses.
function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  if (trailingNumber) return trailingNumber[1].padStart(2, '0');
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const ACCENT_FALLBACK_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft',
  yellow: 'bg-yellow-soft',
  green: 'bg-green-soft',
  pink: 'bg-pink-soft',
  blue: 'bg-blue-soft',
};

export function UpcomingSessionCard({ session }: UpcomingSessionCardProps) {
  const { instructor, classType } = session;
  // overbooked (capacity edited below the booking count) must read explicitly, never hide
  // behind the clamped occupancyRate/occupancyState alone (standing rule for this phase) - the
  // badge label says so, and `booked` below is the raw, never-clamped ledger count against
  // capacity, so the discrepancy is visible in the numbers too.
  const statusLabel = session.overbooked ? 'Overbooked' : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatWeekdayShort(session.date)} · {formatDisplayTime(session.startTime)}
        </span>
        <StatusBadge status={session.occupancyState} label={statusLabel} />
      </div>

      <div className="flex items-center gap-3">
        <AvatarBlobatar
          seed={instructor.id}
          palette={paletteForAccent(classType.accent)}
          size={40}
          alt={instructor.name}
          fallbackInitials={initialsFor(instructor.name)}
          fallbackClassName={ACCENT_FALLBACK_CLASSNAME[classType.accent]}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-ink">{classType.name}</span>
          <span className="truncate text-sm text-text-secondary">{instructor.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <OccupancyBar rate={session.occupancyRate} accent={classType.accent} showPercentage={false} />
        <span className="shrink-0 text-sm text-text-secondary tabular-nums">
          <span className="font-semibold text-ink">{session.booked}</span>/{session.capacity} booked
        </span>
      </div>
    </div>
  );
}
