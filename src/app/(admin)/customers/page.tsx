// Route skeleton only - Phase 5 replaces this with the KPI row, FilterBar and CustomersTable
// (docs/06 section 3.5).
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" subtitle="Membership roster, activity and status." />
      <SectionCard title="All customers">
        <EmptyState
          icon={Users}
          title="This screen isn't built yet"
          description="Phase 5 adds the KPI row, filters and the paginated customers table."
        />
      </SectionCard>
    </div>
  );
}
