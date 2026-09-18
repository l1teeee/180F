'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.2, master plan sections 17-21. Composes the five
// dashboard regions from their hooks; every hook already resolves down through a pure selector
// over the live stores (architecture invariant 2, CLAUDE.md - seed -> repository -> store ->
// selector -> hook -> component, never skipped). Gated on useDemoStatus(): DashboardSkeleton
// while hydrating, ErrorState with a working retry on failure, otherwise the real bento grid.
import type { CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { CalendarCheck, Dumbbell, Gauge, Users } from 'lucide-react';
import { ClassOccupancyList } from '@/components/dashboard/class-occupancy-list';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DASHBOARD_GRID_CLASSNAME, DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { RecentBookingsTable } from '@/components/dashboard/recent-bookings-table';
import { UpcomingSessionsList } from '@/components/dashboard/upcoming-sessions-list';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { useDashboardClassOccupancy } from '@/hooks/use-dashboard-class-occupancy';
import { useDashboardKpis } from '@/hooks/use-dashboard-kpis';
import { useDashboardWeeklyBookings } from '@/hooks/use-dashboard-weekly-bookings';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useRecentBookings } from '@/hooks/use-recent-bookings';
import { useUpcomingSessions } from '@/hooks/use-upcoming-sessions';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

// ADR-012: every Recharts chart loads through next/dynamic with ssr:false and a skeleton
// fallback. weekly-bookings-chart.tsx is the dynamic boundary's leaf - the only file under
// components/dashboard/ that imports 'recharts'.
const WeeklyBookingsChart = dynamic(
  () => import('@/components/dashboard/weekly-bookings-chart').then((mod) => mod.WeeklyBookingsChart),
  { ssr: false, loading: () => <LoadingSkeleton variant="chart" /> },
);

export default function DashboardPage() {
  const status = useDemoStatus();
  const hydrationError = useDemoRuntimeStore((state) => state.error);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);

  const kpis = useDashboardKpis();
  const weeklyBookings = useDashboardWeeklyBookings();
  const classOccupancy = useDashboardClassOccupancy();
  const upcomingSessions = useUpcomingSessions(4);
  const recentBookings = useRecentBookings(6);

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHeader greeting="Good morning" subtitle="Here's what's happening at your studio today." />
        <ErrorState description={hydrationError ?? undefined} onRetry={() => void retryHydration()} />
      </div>
    );
  }

  if (status !== 'ready' || !kpis) {
    return <DashboardSkeleton />;
  }

  const bookingsDeltaDirection =
    kpis.todayBookingsDeltaPct > 0 ? 'up' : kpis.todayBookingsDeltaPct < 0 ? 'down' : 'flat';
  const bookingsDeltaLabel = `${kpis.todayBookingsDeltaPct > 0 ? '+' : ''}${Math.round(kpis.todayBookingsDeltaPct)}% vs yesterday`;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader greeting="Good morning" subtitle="Here's what's happening at your studio today." />

      <div className={DASHBOARD_GRID_CLASSNAME}>
        {/* Row 1 - KPIs. Pattern 4 "Stagger" (docs/03 section 12.2), capped at 6 children. */}
        <div className="animate-fade-up lg:col-span-3" style={{ '--stagger-index': 0 } as CSSProperties}>
          <StatCard
            label="Active members"
            value={kpis.activeMembers}
            delta={{ value: `+${kpis.activeMembersDelta} this month`, direction: 'up' }}
            icon={Users}
            accent="purple"
          />
        </div>
        <div className="animate-fade-up lg:col-span-3" style={{ '--stagger-index': 1 } as CSSProperties}>
          <StatCard
            label="Today's bookings"
            value={kpis.todayBookings}
            delta={{ value: bookingsDeltaLabel, direction: bookingsDeltaDirection }}
            icon={CalendarCheck}
            accent="blue"
          />
        </div>
        <div className="animate-fade-up lg:col-span-3" style={{ '--stagger-index': 2 } as CSSProperties}>
          <StatCard
            label="Occupancy"
            value={Math.round(kpis.occupancyRate * 100)}
            unit="%"
            icon={Gauge}
            accent="green"
          />
        </div>
        <div className="animate-fade-up lg:col-span-3" style={{ '--stagger-index': 3 } as CSSProperties}>
          <StatCard
            label="Today's classes"
            value={kpis.todayClasses}
            delta={{ value: `${kpis.todayAlmostFull} nearly full`, direction: 'flat' }}
            icon={Dumbbell}
            accent="yellow"
          />
        </div>

        {/* Row 2 - weekly chart + class occupancy. */}
        <div className="lg:col-span-8">
          <SectionCard title="Weekly bookings">
            <WeeklyBookingsChart data={weeklyBookings} />
          </SectionCard>
        </div>
        <div className="lg:col-span-4">
          <SectionCard title="Class occupancy">
            <ClassOccupancyList data={classOccupancy} />
          </SectionCard>
        </div>

        {/* Row 3 - upcoming classes + recent bookings. */}
        <div className="lg:col-span-4">
          <SectionCard title="Upcoming classes">
            <UpcomingSessionsList sessions={upcomingSessions} />
          </SectionCard>
        </div>
        <div className="lg:col-span-8">
          <SectionCard title="Recent bookings">
            <RecentBookingsTable rows={recentBookings} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
