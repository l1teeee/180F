// Route skeleton only - Phase 4 replaces this with CalendarToolbar, ScheduleCalendar (FullCalendar,
// next/dynamic ssr:false per ADR-012) and SessionDetailsSheet (docs/06 section 3.3).
import { Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Calendar" subtitle="Weekly, monthly and daily view of every scheduled class." />
      <SectionCard title="Schedule">
        <EmptyState
          icon={Calendar}
          title="This screen isn't built yet"
          description="Phase 4 adds the week/month/day toolbar, the full class schedule and the session detail sheet."
        />
      </SectionCard>
    </div>
  );
}
