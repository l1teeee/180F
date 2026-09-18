// The membership Select in CustomersFilterBar needs the plan list. docs/08-STATE-MANAGEMENT.md
// section 5 confines every store binding to src/hooks, so this thin passthrough is the one place
// that reads it - a plain Zustand selection, no domain/selectors call needed for a passthrough.
import type { MembershipPlan } from '@/domain/types';
import { useCatalogStore } from '@/stores/catalog.store';

export function useCustomersMembershipPlans(): MembershipPlan[] {
  return useCatalogStore((state) => state.membershipPlans);
}
