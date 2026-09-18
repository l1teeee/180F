// docs/07-COMPONENT-ARCHITECTURE.md section 3 "DashboardSkeleton": full-page loading composition
// while useDemoStatus() !== 'ready' (docs/06-ROUTES-AND-SCREENS.md section 3.2 "Loading":
// LoadingSkeleton variants for all five regions, matching each region's final shape). Mirrors
// the real bento grid exactly (DASHBOARD_GRID_CLASSNAME, reused by page.tsx) so real data
// arriving never shifts the layout.
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SectionCard } from '@/components/shared/section-card';

export const DASHBOARD_GRID_CLASSNAME = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className={DASHBOARD_GRID_CLASSNAME}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="lg:col-span-3">
            <LoadingSkeleton variant="kpi" />
          </div>
        ))}

        <div className="lg:col-span-8">
          <SectionCard title="Weekly bookings">
            <LoadingSkeleton variant="chart" />
          </SectionCard>
        </div>
        <div className="lg:col-span-4">
          <SectionCard title="Class occupancy">
            {/* 8 seeded class types (docs/05-MOCK-DATA-STRATEGY.md) - matches the real row count. */}
            <LoadingSkeleton variant="table-row" count={8} />
          </SectionCard>
        </div>

        <div className="lg:col-span-4">
          <SectionCard title="Upcoming classes">
            <LoadingSkeleton variant="table-row" count={4} />
          </SectionCard>
        </div>
        <div className="lg:col-span-8">
          <SectionCard title="Recent bookings">
            <LoadingSkeleton variant="table-row" count={6} />
          </SectionCard>
        </div>
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
