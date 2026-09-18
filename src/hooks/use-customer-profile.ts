import { useMemo } from 'react';
import { selectCustomerStats } from '@/domain/selectors';
import type { CustomerWithStats } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';

export function useCustomerProfile(customerId: string): CustomerWithStats | null {
  const customers = useCustomerStore((state) => state.customers);
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);
  const membershipPlans = useCatalogStore((state) => state.membershipPlans);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || !demoToday) return null;
    return selectCustomerStats(customer, bookings, sessions, membershipPlans, demoToday);
  }, [customers, bookings, sessions, membershipPlans, demoToday, customerId]);
}
