'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.9 / master plan section 29.
import { InstructorGrid } from '@/components/instructors/instructor-grid';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useInstructorsRoster } from '@/hooks/use-instructors-roster';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function InstructorsPage() {
  const status = useDemoRuntimeStore((state) => state.status);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const roster = useInstructorsRoster();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Instructors" subtitle="Studio team, specialties and schedules." />
      {status === 'error' ? (
        <ErrorState onRetry={retryHydration} />
      ) : status !== 'ready' || !roster ? (
        <LoadingSkeleton variant="card" count={6} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" />
      ) : (
        <InstructorGrid instructors={roster} />
      )}
    </div>
  );
}
