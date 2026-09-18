// docs/06-ROUTES-AND-SCREENS.md section 3.5: CustomersTable rows - filterCustomers narrows the
// roster, then selectCustomerStatsFromBookings resolves each remaining customer's per-row view
// model. docs/08-STATE-MANAGEMENT.md section 8.8: indexBookingsByCustomer builds the
// customer->bookings index once per hook call, so each row is an O(1) map lookup instead of a
// full scan of the ~1,200-booking ledger (148 rows x 1,177 bookings, unindexed).
// Caller supplies `filters`; per docs/08-STATE-MANAGEMENT.md section 6 point 5, a caller passing
// this object down from a render body memoises it themselves (the customers page holds it in
// useState, so its identity is already stable between renders).
import { useMemo } from 'react';
import { filterCustomers, indexBookingsByCustomer, selectCustomerStatsFromBookings } from '@/domain/selectors';
import type { CustomerFilters, CustomerWithStats } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';

export function useCustomersRows(filters: CustomerFilters): CustomerWithStats[] {
  const customers = useCustomerStore((state) => state.customers);
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);
  const membershipPlans = useCatalogStore((state) => state.membershipPlans);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return [];
    const filtered = filterCustomers(customers, filters);
    const bookingsByCustomer = indexBookingsByCustomer(bookings);
    return filtered.map((customer) =>
      selectCustomerStatsFromBookings(
        customer,
        bookingsByCustomer.get(customer.id) ?? [],
        sessions,
        membershipPlans,
        demoToday,
      ),
    );
  }, [customers, bookings, sessions, membershipPlans, demoToday, filters]);
}
