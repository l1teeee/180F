// docs/06-ROUTES-AND-SCREENS.md section 3.10: reused for both "Weekly schedule" and "Recent
// classes". ClassIcon/ACCENT_ICON_BG_CLASS are imported from components/classes rather than
// duplicated a third time - both directories are this same phase's write set (docs/12
// "Phase 6 - classes and instructors" is one agent, one wave), so this one cross-feature import
// carries no concurrent-agent risk the way importing from booking/ or shared/ would.
import { TriangleAlert } from 'lucide-react';
import { ACCENT_ICON_BG_CLASS } from '@/components/classes/class-accent';
import { ClassIcon } from '@/components/classes/class-icon';
import { StatusBadge } from '@/components/shared/status-badge';
import type { SessionCard } from '@/domain/types';
import { formatDisplayDateShort, formatDisplayTime } from '@/lib/dates';

// Reads `overbooked` explicitly rather than only the clamped occupancyRate (CLAUDE.md standing
// rule) - identical to class-schedule-list.tsx's tag, duplicated rather than shared because the
// two components render different row content around it.
function SessionOccupancyTag({ session }: { session: SessionCard }) {
  if (session.overbooked) {
    return (
      <span className="inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-pill bg-danger-soft px-2.5 text-xs font-semibold whitespace-nowrap text-danger-text">
        <TriangleAlert aria-hidden="true" className="size-3" />
        {session.booked}/{session.capacity} · Overbooked
      </span>
    );
  }
  return <StatusBadge status={session.occupancyState} label={`${session.booked}/${session.capacity} spots`} />;
}

export interface InstructorSessionListProps {
  sessions: SessionCard[]; // already chronological, cancelled sessions excluded
  emptyMessage: string;
}

export function InstructorSessionList({ sessions, emptyMessage }: InstructorSessionListProps) {
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
          <SessionOccupancyTag session={session} />
        </div>
      ))}
    </div>
  );
}
