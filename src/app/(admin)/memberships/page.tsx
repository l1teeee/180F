// Route skeleton only - Phase 7 replaces this with 4 MembershipCards and PlanEditDialog
// (docs/06 section 3.11).
import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function MembershipsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Memberships" subtitle="Plans, pricing and member counts." />
      <SectionCard title="Plans">
        <EmptyState
          icon={CreditCard}
          title="This screen isn't built yet"
          description="Phase 7 adds the 4 membership plan cards with edit-plan and view-members actions."
        />
      </SectionCard>
    </div>
  );
}
