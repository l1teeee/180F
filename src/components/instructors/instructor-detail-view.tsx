'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.10. Same split as class-detail-view.tsx: owns the
// loading/error/not-found decision, notFound() only reachable once status === 'ready'.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useInstructorDetail } from '@/hooks/use-instructor-detail';
import { useMessages } from '@/hooks/use-messages';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { InstructorDetail } from './instructor-detail';

function InstructorDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <LoadingSkeleton variant="card" />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-8">
        <LoadingSkeleton variant="kpi" count={4} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" />
        <LoadingSkeleton variant="table-row" count={3} />
      </div>
    </div>
  );
}

export function InstructorDetailView({ instructorId }: { instructorId: string }) {
  const m = useMessages();
  const status = useDemoRuntimeStore((state) => state.status);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const detail = useInstructorDetail(instructorId);

  if (status === 'error') return <ErrorState title={m.instructors.errorTitle} onRetry={retryHydration} />;
  if (status !== 'ready') return <InstructorDetailSkeleton />;
  // demoToday is always set alongside status === 'ready' (demo-runtime.store.ts hydrateDemo) -
  // checked here only so TypeScript narrows it from ISODate | null for the prop below.
  if (!detail || !demoToday) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/instructors"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {m.instructors.backToInstructors}
      </Link>

      <InstructorDetail
        instructor={detail.instructor}
        accent={detail.accent}
        upcoming={detail.upcoming}
        recentClasses={detail.recentClasses}
        demoToday={demoToday}
      />
    </div>
  );
}
