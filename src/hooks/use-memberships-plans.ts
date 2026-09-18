// docs/06-ROUTES-AND-SCREENS.md section 3.11: membershipPlans is static catalog data (no
// selector needed), but the member count shown on each card is a number on screen, so it still
// has to come from a hook rather than JSX arithmetic (docs/07 section 1 rule 2). Docs/06 3.11
// also decides this stays a plain array filter instead of a new domain/selectors export, since
// it is a one-off UI count, not a cross-screen derived stat.
import { useMemo } from 'react';
import type { MembershipPlan } from '@/domain/types';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export interface MembershipPlanRow {
  plan: MembershipPlan;
  memberCount: number;
}

export function useMembershipPlanRows(): MembershipPlanRow[] | null {
  const status = useDemoRuntimeStore((state) => state.status);
  const plans = useCatalogStore((state) => state.membershipPlans);
  const customers = useCustomerStore((state) => state.customers);

  return useMemo(() => {
    if (status !== 'ready') return null;
    return plans.map((plan) => ({
      plan,
      memberCount: customers.filter((customer) => customer.membershipId === plan.id).length,
    }));
  }, [status, plans, customers]);
}
