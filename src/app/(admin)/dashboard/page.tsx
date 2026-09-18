// Route skeleton only - docs/10-IMPLEMENTATION-PLAN.md Phase 3 replaces this with
// DashboardHeader, the KPI row, the weekly chart, class occupancy, upcoming sessions and recent
// bookings (docs/06-ROUTES-AND-SCREENS.md section 3.2). No hooks are read here, so this stays a
// plain Server Component; Phase 3 adds 'use client' when it wires in the real hooks.
import { LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Studio overview and today's activity." />
      <SectionCard title="Overview">
        <EmptyState
          icon={LayoutDashboard}
          title="This screen isn't built yet"
          description="Phase 3 adds the KPI row, weekly bookings chart, class occupancy, upcoming sessions and recent bookings."
        />
      </SectionCard>
    </div>
  );
}
