// docs/06-ROUTES-AND-SCREENS.md section 3.5: the four /customers KPI cards. "Inactive" reuses
// filterCustomers rather than a dedicated selector - this document's decision, matching docs/06
// section 3.5's own note that this mapping isn't named individually in docs/08 section 4.
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { filterCustomers, selectActiveMembers, selectNewThisMonth } from '@/domain/selectors';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export interface CustomersKpis {
  totalCustomers: number;
  activeMemberships: number;
  newThisMonth: number;
  inactive: number;
}

export function useCustomersKpis(): CustomersKpis | null {
  const { status, demoToday } = useDemoRuntimeStore(
    useShallow((state) => ({ status: state.status, demoToday: state.demoToday })),
  );
  const customers = useCustomerStore((state) => state.customers);

  return useMemo(() => {
    if (status !== 'ready' || !demoToday) return null;
    return {
      totalCustomers: customers.length,
      activeMemberships: selectActiveMembers(customers),
      newThisMonth: selectNewThisMonth(customers, demoToday),
      inactive: filterCustomers(customers, { query: '', status: 'inactive', membershipId: 'all' }).length,
    };
  }, [status, demoToday, customers]);
}
