import { useMemo } from 'react';
import { selectWeeklyBookingTrend } from '@/domain/selectors';
import type { WeeklyBookingPoint } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';

export function useDashboardWeeklyBookings(): WeeklyBookingPoint[] {
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);

  return useMemo(() => {
    if (!demoToday) return [];
    return selectWeeklyBookingTrend(bookings, sessions, demoToday);
  }, [bookings, sessions, demoToday]);
}
