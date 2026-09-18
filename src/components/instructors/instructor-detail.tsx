// docs/07-COMPONENT-ARCHITECTURE.md section 3 "InstructorDetail". docs/06 section 3.10: left
// column profile (span 4), right column stats row -> weekly schedule -> recent classes ->
// calendar preview (span 8). Composes the smaller single-responsibility pieces in this folder
// rather than mixing their markup inline, per CLAUDE.md "one abstraction level per function".
import { SectionCard } from '@/components/shared/section-card';
import type { AccentToken, InstructorWithStats, ISODate, SessionCard } from '@/domain/types';
import { InstructorProfileCard } from './instructor-profile-card';
import { InstructorSchedulePreview } from './instructor-schedule-preview';
import { InstructorSessionList } from './instructor-session-list';
import { InstructorStatsRow } from './instructor-stats-row';

export interface InstructorDetailProps {
  instructor: InstructorWithStats;
  accent: AccentToken;
  upcoming: SessionCard[];
  recentClasses: SessionCard[];
  demoToday: ISODate;
}

export function InstructorDetail({ instructor, accent, upcoming, recentClasses, demoToday }: InstructorDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <InstructorProfileCard instructor={instructor} accent={accent} />
      </div>

      <div className="flex flex-col gap-6 lg:col-span-8">
        <InstructorStatsRow instructor={instructor} />

        <SectionCard title="Weekly schedule">
          <InstructorSessionList sessions={upcoming} emptyMessage="No upcoming sessions this week." />
        </SectionCard>

        <SectionCard title="Recent classes">
          <InstructorSessionList sessions={recentClasses.slice(0, 6)} emptyMessage="No classes taught yet." />
        </SectionCard>

        <SectionCard title="Schedule preview">
          <InstructorSchedulePreview sessions={upcoming} demoToday={demoToday} />
        </SectionCard>
      </div>
    </div>
  );
}
