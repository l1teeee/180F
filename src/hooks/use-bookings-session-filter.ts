'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.3: the session sheet's "View bookings" link must land
// on the bookings table filtered to that one session, with the filter visible and clearable, and
// the URL carrying it so the link is shareable. filterBookings (src/domain/selectors/bookings.ts)
// has no session-id filter and src/domain/** is out of scope for this task, so this hook composes
// the extra filtering on top of the caller's already-filtered rows instead (docs/08-STATE-
// MANAGEMENT.md section 8.3 style, same as use-calendar-events.ts composing outside domain/).
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BookingRow } from '@/domain/types';

export interface BookingsSessionFilter {
  sessionId: string | null;
  rows: BookingRow[]; // `rows` further narrowed to sessionId, unchanged when absent
  clear: () => void;
}

export function useBookingsSessionFilter(rows: BookingRow[]): BookingsSessionFilter {
  const router = useRouter();
  const sessionId = useSearchParams().get('sessionId');

  const filteredRows = useMemo(() => {
    if (!sessionId) return rows;
    return rows.filter((row) => row.session.id === sessionId);
  }, [rows, sessionId]);

  return {
    sessionId,
    rows: filteredRows,
    // replace (not push): clearing the filter should not leave a back-button trip through it.
    clear: () => router.replace('/bookings'),
  };
}
