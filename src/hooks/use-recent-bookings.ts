import { useMemo } from 'react';
import { selectRecentBookings } from '@/domain/selectors';
import type { BookingRow } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';
import { buildBookingRowLookups, toBookingRow } from './to-booking-row';

export function useRecentBookings(limit = 6): BookingRow[] {
  const bookings = useBookingStore((state) => state.bookings);
  const customers = useCustomerStore((state) => state.customers);
  const sessions = useSessionStore((state) => state.sessions);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);

  return useMemo(() => {
    const recent = selectRecentBookings(bookings, limit);
    const lookups = buildBookingRowLookups(customers, sessions, classTypes, instructors);
    const rows: BookingRow[] = [];
    for (const booking of recent) {
      const row = toBookingRow(booking, lookups);
      if (row) rows.push(row);
    }
    return rows;
  }, [bookings, limit, customers, sessions, classTypes, instructors]);
}
