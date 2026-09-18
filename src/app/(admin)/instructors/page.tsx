// Route skeleton only - Phase 6 replaces this with InstructorGrid, 6 InstructorCards
// (docs/06 section 3.9).
import { GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function InstructorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Instructors" subtitle="Studio team, specialties and schedules." />
      <SectionCard title="Studio team">
        <EmptyState
          icon={GraduationCap}
          title="This screen isn't built yet"
          description="Phase 6 adds the 6 instructor cards with specialty, weekly sessions, rating and status."
        />
      </SectionCard>
    </div>
  );
}
