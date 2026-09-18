'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4. PageHeader's CTA and the empty state's action both
// open the same BookingDialog; cancelling reuses the shared destructive ConfirmDialog
// (docs/03-DESIGN-SYSTEM.md section 11.4-B) with override: true (docs/08-STATE-MANAGEMENT.md
// section 8.3: "Admin actions may pass an explicit override: true").
import { Suspense, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingDialog } from '@/components/bookings/booking-dialog';
import { BookingFiltersBar } from '@/components/bookings/booking-filters';
import { BookingsTable } from '@/components/bookings/bookings-table';
import { StatusTabs } from '@/components/bookings/status-tabs';
import type { BookingFilters, BookingRow } from '@/domain/types';
import { useBookingRows } from '@/hooks/use-booking-rows';
import { useBookingsSessionFilter } from '@/hooks/use-bookings-session-filter';
import { useBookingsTabCounts, type BookingsTabKey } from '@/hooks/use-bookings-tab-counts';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useSessionCard } from '@/hooks/use-session-card';
import { formatDisplayDateShort, formatDisplayTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

const EMPTY_FILTERS: BookingFilters = { query: '', status: 'all', source: 'all', date: null };

// next/navigation's useSearchParams (read inside useBookingsSessionFilter) requires a Suspense
// boundary above it - this page is entirely client-rendered (ADR-004: no server data fetching),
// so that boundary never actually suspends past its first paint.
export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageContent() {
  const status = useDemoStatus();
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null);

  // Tab counts intentionally ignore the status filter itself (docs/08 section 6 point 5: this
  // object is passed down from a render body, so it is memoised here rather than inside the hook).
  const tabFilters = useMemo(
    () => ({ query: filters.query, source: filters.source, date: filters.date }),
    [filters.query, filters.source, filters.date],
  );
  const tabCounts = useBookingsTabCounts(tabFilters);
  const rows = useBookingRows(filters);
  const sessionFilter = useBookingsSessionFilter(rows);
  const filteredSession = useSessionCard(sessionFilter.sessionId ?? '');

  function handleTabChange(tab: BookingsTabKey) {
    setFilters((prev) => ({ ...prev, status: tab }));
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    const result = await useBookingStore.getState().cancelBooking(cancelTarget.id, { override: true });
    if (!result.ok) {
      toast.error(result.message);
      // ConfirmDialog's contract (src/components/shared/confirm-dialog.tsx): a thrown onConfirm
      // keeps the dialog open instead of closing on a rejection it never explains itself.
      throw new Error(result.reason);
    }
    toast.success('Booking cancelled');
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Bookings" subtitle="Manage all class reservations." />
        <SectionCard title="All bookings">
          <ErrorState onRetry={() => void useDemoRuntimeStore.getState().retryHydration()} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bookings"
        subtitle="Manage all class reservations."
        actions={
          <Button type="button" variant="ink" onClick={() => setDialogOpen(true)}>
            New booking
          </Button>
        }
      />

      <SectionCard title="All bookings">
        {status !== 'ready' ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-10 w-80" />
            <LoadingSkeleton variant="table-row" count={6} />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <BookingFiltersBar filters={filters} onFiltersChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
            {sessionFilter.sessionId ? (
              <div className="flex flex-wrap items-center gap-2 rounded-chip border border-purple-soft bg-purple-xsoft px-3.5 py-2.5 text-sm text-purple-deep">
                <span className="font-medium">
                  Filtered to session: {filteredSession ? `${filteredSession.classType.name} · ${formatDisplayDateShort(filteredSession.date)} · ${formatDisplayTime(filteredSession.startTime)}` : sessionFilter.sessionId}
                </span>
                <Button type="button" variant="ghost" onClick={sessionFilter.clear} className="ml-auto h-7 shrink-0 px-2 text-purple-deep hover:bg-purple-soft">
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            ) : null}
            <StatusTabs value={filters.status} onValueChange={handleTabChange} counts={tabCounts} />
            <BookingsTable rows={sessionFilter.rows} onCancelRequest={setCancelTarget} onCreateBooking={() => setDialogOpen(true)} />
          </div>
        )}
      </SectionCard>

      <BookingDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `This cancels ${cancelTarget.customer.name}'s booking for ${cancelTarget.classType.name} on ${formatDisplayDateShort(cancelTarget.session.date)} and cannot be undone.`
            : undefined
        }
        confirmLabel="Cancel booking"
        destructive
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
