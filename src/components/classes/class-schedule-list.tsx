// docs/06-ROUTES-AND-SCREENS.md section 3.8 "weekly schedule list". Each row must read
// `SessionCard.overbooked` and say so explicitly rather than only showing the clamped
// occupancyRate (CLAUDE.md standing rule) - components/shared/OccupancyBar has no `overbooked`
// prop and is read-only, so this local tag is the variation built for this feature folder.
import { TriangleAlert } from 'lucide-react';
import { AvatarBlobatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Messages } from '@/i18n/messages';
import type { SessionCard } from '@/domain/types';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useMessages } from '@/hooks/use-messages';
import { paletteForAccent } from '@/lib/avatar';

function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  return trailingNumber ? trailingNumber[1].padStart(2, '0') : name.slice(0, 2).toUpperCase();
}

function SessionOccupancyTag({ session, m }: { session: SessionCard; m: Messages['classes'] }) {
  if (session.overbooked) {
    return (
      <span className="inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-pill bg-danger-soft px-2.5 text-xs font-semibold whitespace-nowrap text-danger-text">
        <TriangleAlert aria-hidden="true" className="size-3" />
        {session.booked}/{session.capacity} · {m.overbooked}
      </span>
    );
  }
  return <StatusBadge status={session.occupancyState} label={m.spotsLabel(session.booked, session.capacity)} />;
}

export interface ClassScheduleListProps {
  sessions: SessionCard[]; // already chronological, cancelled sessions excluded
}

export function ClassScheduleList({ sessions }: ClassScheduleListProps) {
  const m = useMessages();
  const { formatDisplayDateShort, formatDisplayTime } = useDateLocale();

  if (sessions.length === 0) {
    return <p className="py-6 text-center text-sm text-text-secondary">{m.classes.emptyStates.noSessionsScheduled}</p>;
  }

  return (
    <div className="flex flex-col">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex w-16 shrink-0 flex-col">
              <span className="text-sm font-semibold text-ink">{formatDisplayDateShort(session.date)}</span>
              <span className="text-xs text-text-secondary">{formatDisplayTime(session.startTime)}</span>
            </div>
            <AvatarBlobatar
              seed={session.instructor.id}
              palette={paletteForAccent(session.classType.accent)}
              size={32}
              alt={session.instructor.name}
              fallbackInitials={initialsFor(session.instructor.name)}
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-ink">{session.instructor.name}</span>
              <span className="truncate text-xs text-text-secondary">{session.room}</span>
            </div>
          </div>
          <SessionOccupancyTag session={session} m={m.classes} />
        </div>
      ))}
    </div>
  );
}
