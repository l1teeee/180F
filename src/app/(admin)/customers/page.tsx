'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.5. KPI row -> FilterBar -> paginated CustomersTable.
// docs/08-STATE-MANAGEMENT.md section 8.4: while status isn't 'ready', every stat card and the
// table show a loading skeleton; on 'error', ErrorState with a working retry (this phase's brief).
import { useState } from 'react';
import { CreditCard, UserPlus, Users, UserX } from 'lucide-react';
import { CustomersFilterBar } from '@/components/customers/customers-filter-bar';
import { CustomersTable } from '@/components/customers/customers-table';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import type { CustomerFilters } from '@/domain/types';
import { useCustomersKpis } from '@/hooks/use-customers-kpis';
import { useCustomersMembershipPlans } from '@/hooks/use-customers-membership-plans';
import { useCustomersRows } from '@/hooks/use-customers-rows';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

const INITIAL_FILTERS: CustomerFilters = { query: '', status: 'all', membershipId: 'all' };

export default function CustomersPage() {
  const status = useDemoStatus();
  // Direct store reads for `error`/retry (not routed through a src/hooks binding) match the
  // existing precedent in src/components/booking/booking-error-state.tsx for this exact
  // infra-level concern - narrower than a business-data selector, so it stays inline per view.
  const error = useDemoRuntimeStore((state) => state.error);
  const [filters, setFilters] = useState<CustomerFilters>(INITIAL_FILTERS);
  const kpis = useCustomersKpis();
  const membershipPlans = useCustomersMembershipPlans();
  const rows = useCustomersRows(filters);

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Customers" subtitle="Membership roster, activity and status." />
        <ErrorState description={error ?? undefined} onRetry={() => void useDemoRuntimeStore.getState().retryHydration()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" subtitle="Membership roster, activity and status." />

      {/* docs/06-ROUTES-AND-SCREENS.md section 3.5 responsive table: 2x2 AT the 1024px row, not
          4-across - Tailwind's `lg` breakpoint is a 1024px min-width, so escalating there would
          already show 4-across exactly at 1024px. `xl` (1280px) is the first tier inside the
          1440px "primary" width the four-across layout is specified for. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value={kpis?.totalCustomers ?? 0} icon={Users} accent="purple" loading={!kpis} />
        <StatCard label="Active memberships" value={kpis?.activeMemberships ?? 0} icon={CreditCard} accent="green" loading={!kpis} />
        <StatCard label="New this month" value={kpis?.newThisMonth ?? 0} icon={UserPlus} accent="yellow" loading={!kpis} />
        <StatCard label="Inactive" value={kpis?.inactive ?? 0} icon={UserX} accent="blue" loading={!kpis} />
      </div>

      <CustomersFilterBar filters={filters} onFiltersChange={setFilters} membershipPlans={membershipPlans} />

      <SectionCard title="All customers">
        {status !== 'ready' ? <LoadingSkeleton variant="table-row" count={6} /> : <CustomersTable rows={rows} />}
      </SectionCard>
    </div>
  );
}
