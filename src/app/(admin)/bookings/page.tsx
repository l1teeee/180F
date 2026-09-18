// Route skeleton only - Phase 4 replaces this with StatusTabs, BookingFilters, BookingsTable
// (DataTable) and BookingDialog (docs/06 section 3.4). Subtitle copy is the master-plan literal.
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bookings" subtitle="Manage all class reservations." />
      <SectionCard title="All bookings">
        <EmptyState
          icon={ClipboardList}
          title="This screen isn't built yet"
          description="Phase 4 adds the status tabs, filters, the bookings table and the new-booking dialog."
        />
      </SectionCard>
    </div>
  );
}
