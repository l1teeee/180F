// Phase 4 (docs/06-ROUTES-AND-SCREENS.md section 3.4): "Tabs: All, Confirmed, Pending,
// Cancelled, Waitlist, each showing a live count." Reuses the existing filterBookings selector
// once per tab rather than adding a new domain/selectors export for "count by status."
import { useMemo } from 'react';
import { filterBookings } from '@/domain/selectors';
import type { BookingFilters, BookingStatus } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useSessionStore } from '@/stores/session.store';

export type BookingsTabKey = 'all' | BookingStatus;

export const BOOKINGS_TAB_KEYS: BookingsTabKey[] = ['all', 'confirmed', 'pending', 'cancelled', 'waitlist'];

// The non-status filters (search/date/source) still apply per tab, so each count answers "how
// many bookings match what's already searched/filtered, for this status" - only the status axis
// itself varies across tabs. Without this, every tab but the active one would just repeat the
// active tab's own count.
export type BookingsTabFilters = Omit<BookingFilters, 'status'>;

export function useBookingsTabCounts(filters: BookingsTabFilters): Record<BookingsTabKey, number> {
  const bookings = useBookingStore((state) => state.bookings);
  const customers = useCustomerStore((state) => state.customers);
  const sessions = useSessionStore((state) => state.sessions);

  return useMemo(() => {
    const counts = {} as Record<BookingsTabKey, number>;
    for (const tab of BOOKINGS_TAB_KEYS) {
      counts[tab] = filterBookings(bookings, sessions, customers, { ...filters, status: tab }).length;
    }
    return counts;
  }, [bookings, sessions, customers, filters]);
}
