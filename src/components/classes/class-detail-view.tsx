'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.8. Owns the loading/error/not-found decision so the
// route's page.tsx (a Server Component, matching the /book/[classId] convention) can stay a
// plain params-unwrapping shell. notFound() is only reachable once status === 'ready' AND the
// id still fails to resolve (docs/06 section 2 "Not-found behavior for unknown entity ids").
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ClassDetail } from './class-detail';
import { ClassScheduleList } from './class-schedule-list';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useMessages } from '@/hooks/use-messages';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

// ADR-012: every Recharts chart loads through next/dynamic with ssr:false. The leaf chart
// component lives in its own file (class-weekday-chart.tsx) so this is the only dynamic boundary.
const ClassWeekdayChart = dynamic(() => import('./class-weekday-chart').then((mod) => mod.ClassWeekdayChart), {
  ssr: false,
  loading: () => <LoadingSkeleton variant="chart" />,
});

function toPercentValue(rate: number): number {
  return Math.round(rate * 100);
}

function ClassDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="kpi" count={3} className="grid grid-cols-1 gap-5 sm:grid-cols-3" />
      <LoadingSkeleton variant="chart" />
      <LoadingSkeleton variant="table-row" count={4} />
    </div>
  );
}

export function ClassDetailView({ classTypeId }: { classTypeId: string }) {
  const m = useMessages();
  const status = useDemoRuntimeStore((state) => state.status);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const detail = useClassDetail(classTypeId);
  const isSimulatedLoading = useSimulatedLoading('classDetail');

  if (status === 'error') return <ErrorState title={m.classes.errorTitle} onRetry={retryHydration} />;
  if (status !== 'ready' || isSimulatedLoading) return <ClassDetailSkeleton />;
  if (!detail) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/classes"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {m.classes.backToClasses}
      </Link>

      <ClassDetail classType={detail.classType} instructors={detail.instructors} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label={m.classes.stats.averageOccupancy}
          value={toPercentValue(detail.classType.averageOccupancy)}
          unit="%"
          accent="purple"
        />
        <StatCard label={m.classes.stats.bookingsThisMonth} value={detail.classType.bookingsThisMonth} accent="green" />
        <StatCard
          label={m.classes.stats.cancellationRate}
          value={toPercentValue(detail.classType.cancellationRate)}
          unit="%"
          accent="pink"
        />
      </div>

      <SectionCard title={m.classes.sections.bookingsByWeekday}>
        <ClassWeekdayChart data={detail.weekdayBookings} highlightDay={detail.highlightDay} />
      </SectionCard>

      <SectionCard title={m.classes.sections.weeklySchedule}>
        <ClassScheduleList sessions={detail.sessions} />
      </SectionCard>
    </div>
  );
}
