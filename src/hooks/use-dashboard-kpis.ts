import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectDashboardKpis } from '@/domain/selectors';
import type { DashboardKpis } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';

export function useDashboardKpis(): DashboardKpis | null {
  const { status, demoToday } = useDemoRuntimeStore(
    useShallow((state) => ({ status: state.status, demoToday: state.demoToday })),
  );
  const customers = useCustomerStore((state) => state.customers);
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);

  return useMemo(() => {
    if (status !== 'ready' || !demoToday) return null;
    return selectDashboardKpis(customers, bookings, sessions, demoToday);
  }, [status, demoToday, customers, bookings, sessions]);
}
