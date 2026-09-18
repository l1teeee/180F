// docs/06-ROUTES-AND-SCREENS.md section 3.6: the /customers/[id] recent-activity timeline.
import { useMemo } from 'react';
import { selectCustomerActivity } from '@/domain/selectors';
import type { CustomerActivityEntry } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useSessionStore } from '@/stores/session.store';

export function useCustomersActivity(customerId: string): CustomerActivityEntry[] {
  const customers = useCustomerStore((state) => state.customers);
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);
  const classTypes = useCatalogStore((state) => state.classTypes);

  return useMemo(() => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return [];
    return selectCustomerActivity(customer, bookings, sessions, classTypes);
  }, [customers, bookings, sessions, classTypes, customerId]);
}
