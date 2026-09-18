// docs/06-ROUTES-AND-SCREENS.md section 3.10: reused for both "Weekly schedule" and "Recent
// classes". ClassIcon/ACCENT_ICON_BG_CLASS are imported from components/classes rather than
// duplicated a third time - both directories are this same phase's write set (docs/12
// "Phase 6 - classes and instructors" is one agent, one wave), so this one cross-feature import
// carries no concurrent-agent risk the way importing from booking/ or shared/ would.
import { TriangleAlert } from 'lucide-react';
import { ACCENT_ICON_BG_CLASS, ClassIcon } from '@/components/shared/class-icon';
import { StatusBadge } from '@/components/shared/status-badge';
import type { SessionCard } from '@/domain/types';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';

// Reads `overbooked` explicitly rather than only the clamped occupancyRate (CLAUDE.md standing
// rule) - identical to class-schedule-list.tsx's tag, duplicated rather than shared because the
// two components render different row content around it.
function SessionOccupancyTag({ session, m }: { session: SessionCard; m: Messages['instructors'] }) {
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

export interface InstructorSessionListProps {
  sessions: SessionCard[]; // already chronological, cancelled sessions excluded
  emptyMessage: string;
}

export function InstructorSessionList({ sessions, emptyMessage }: InstructorSessionListProps) {
  const m = useMessages();
  const { formatDisplayDateShort, formatDisplayTime } = useDateLocale();

  if (sessions.length === 0) {
    return <p className="py-6 text-center text-sm text-text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className={`flex size-9 shrink-0 items-center justify-center rounded-chip ${ACCENT_ICON_BG_CLASS[session.classType.accent]}`}
            >
              <ClassIcon name={session.classType.icon} className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-ink">{session.classType.name}</span>
              <span className="truncate text-xs text-text-secondary">
                {formatDisplayDateShort(session.date)} · {formatDisplayTime(session.startTime)} · {session.room}
              </span>
            </div>
          </div>
          <SessionOccupancyTag session={session} m={m.instructors} />
        </div>
      ))}
    </div>
  );
}
