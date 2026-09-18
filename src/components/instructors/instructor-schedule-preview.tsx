// docs/06-ROUTES-AND-SCREENS.md section 3.10 "calendar preview". docs/07 names this a "session-
// list calendar preview reusing ScheduleCalendar in a constrained height" - ScheduleCalendar
// (components/calendar/**) belongs to the concurrent Phase 4 agent's write set and does not exist
// yet, so this builds a compact, purpose-made 7-day agenda strip instead, reported as a
// deviation. Presentational grouping only (bucketing already-resolved SessionCard[] by date) -
// no occupancy or count is computed here.
import type { ISODate, SessionCard } from '@/domain/types';
import { addDaysISO, formatDisplayTime, formatWeekdayShort, getDayOfMonth } from '@/lib/dates';

export interface InstructorSchedulePreviewProps {
  sessions: SessionCard[]; // upcoming, chronological
  demoToday: ISODate;
}

const PREVIEW_DAYS = 7;

export function InstructorSchedulePreview({ sessions, demoToday }: InstructorSchedulePreviewProps) {
  const days = Array.from({ length: PREVIEW_DAYS }, (_, index) => addDaysISO(demoToday, index));

  const sessionsByDate = new Map<ISODate, SessionCard[]>();
  for (const session of sessions) {
    const bucket = sessionsByDate.get(session.date);
    if (bucket) {
      bucket.push(session);
    } else {
      sessionsByDate.set(session.date, [session]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 min-[560px]:grid-cols-4 lg:grid-cols-7">
      {days.map((date) => {
        const daySessions = sessionsByDate.get(date) ?? [];
        const isToday = date === demoToday;
        return (
          <div
            key={date}
            className={`flex flex-col gap-2 rounded-card-sm border p-3 ${
              isToday ? 'border-purple-deep bg-purple-xsoft' : 'border-border bg-surface'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-text-secondary">{formatWeekdayShort(date)}</span>
              <span className="text-sm font-bold text-ink tabular-nums">{getDayOfMonth(date)}</span>
            </div>
            {daySessions.length === 0 ? (
              <span className="text-xs text-text-secondary">No classes</span>
            ) : (
              <div className="flex flex-col gap-1">
                {daySessions.map((session) => (
                  <span key={session.id} className="truncate text-xs font-medium text-ink tabular-nums">
                    {formatDisplayTime(session.startTime)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
