import { useMemo } from 'react';
import { filterBookings } from '@/domain/selectors';
import type { BookingFilters, BookingRow } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useInstructorStore } from '@/stores/instructor.store';
import { useSessionStore } from '@/stores/session.store';
import { buildBookingRowLookups, toBookingRow } from './to-booking-row';

// Caller supplies `filters`; per docs/08 section 6 point 5, a caller passing this object down
// from a render body memoises it themselves - this hook cannot do that on its behalf.
export function useBookingRows(filters: BookingFilters): BookingRow[] {
  const bookings = useBookingStore((state) => state.bookings);
  const customers = useCustomerStore((state) => state.customers);
  const sessions = useSessionStore((state) => state.sessions);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);

  return useMemo(() => {
    const filtered = filterBookings(bookings, sessions, customers, filters);
    const lookups = buildBookingRowLookups(customers, sessions, classTypes, instructors);
    const rows: BookingRow[] = [];
    for (const booking of filtered) {
      const row = toBookingRow(booking, lookups);
      if (row) rows.push(row);
    }
    return rows;
  }, [bookings, sessions, customers, filters, classTypes, instructors]);
}
