'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.11. Phase 7 write set (docs/12-AGENT-OWNERSHIP.md).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { MembershipCard } from '@/components/memberships/membership-card';
import { PlanEditDialog } from '@/components/memberships/plan-edit-dialog';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMembershipPlanRows } from '@/hooks/use-memberships-plans';
import { useMessages } from '@/hooks/use-messages';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function MembershipsPage() {
  const m = useMessages();
  const status = useDemoStatus();
  const isSimulatedLoading = useSimulatedLoading('memberships');
  const error = useDemoRuntimeStore((state) => state.error);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const rows = useMembershipPlanRows();
  const router = useRouter();

  // The dialog is shared across all four cards - editingPlanId points at whichever plan was
  // last opened and is left as-is on close (only editOpen flips) so PlanEditDialog still has a
  // real plan to render while its 150ms close transition (docs/03 section 11.5) plays out.
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const editingPlan = rows?.find((row) => row.plan.id === editingPlanId)?.plan ?? null;

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.memberships.pageTitle} subtitle={m.memberships.pageSubtitle} />
        <ErrorState description={error ?? m.memberships.errorDescription} onRetry={retryHydration} />
      </div>
    );
  }

  if (status !== 'ready' || !rows || isSimulatedLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.memberships.pageTitle} subtitle={m.memberships.pageSubtitle} />
        <LoadingSkeleton
          variant="plan-card"
          count={4}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.memberships.pageTitle} subtitle={m.memberships.pageSubtitle} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map(({ plan, memberCount }) => (
          <MembershipCard
            key={plan.id}
            plan={plan}
            memberCount={memberCount}
            onEdit={() => {
              setEditingPlanId(plan.id);
              setEditOpen(true);
            }}
            onViewMembers={() => router.push(`/customers?membershipId=${plan.id}`)}
          />
        ))}
      </div>

      <PlanEditDialog plan={editingPlan} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
