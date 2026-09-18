'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4. PageHeader's CTA and the empty state's action both
// open the same BookingDialog; cancelling reuses the shared destructive ConfirmDialog
// (docs/03-DESIGN-SYSTEM.md section 11.4-B) with override: true (docs/08-STATE-MANAGEMENT.md
// section 8.3: "Admin actions may pass an explicit override: true").
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { indexBookingsBySession, selectSessionOccupancy } from '@/domain/selectors';
import type { BookingFilters, BookingRow } from '@/domain/types';
import { useBookingRows } from '@/hooks/use-booking-rows';
import { useBookingsSessionFilter } from '@/hooks/use-bookings-session-filter';
import { useBookingsTabCounts, type BookingsTabKey } from '@/hooks/use-bookings-tab-counts';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMessages } from '@/hooks/use-messages';
import { useSessionCard } from '@/hooks/use-session-card';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';

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
  const m = useMessages();
  const { formatDisplayDateShort, formatDisplayTime } = useDateLocale();
  const status = useDemoStatus();
  const isSimulatedLoading = useSimulatedLoading('bookings');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);

  // Sidebar rail contract (app-sidebar.tsx): "New booking" pushes /bookings?new=1 from any admin
  // page. Opening the dialog reacts to a fresh ?new=1 by adjusting state during render (the same
  // "derive state from a changed value" pattern confirm-dialog.tsx uses for its own opener
  // capture) rather than in an effect, so it happens exactly once per distinct arrival of the
  // param, whether that is the first load or a later click of the same sidebar button while
  // already on this page - lastHandledSearch is the "have we already reacted to this URL" guard.
  const searchString = searchParams.toString();
  const [lastHandledSearch, setLastHandledSearch] = useState<string | null>(null);
  if (searchString !== lastHandledSearch) {
    setLastHandledSearch(searchString);
    if (searchParams.get('new') === '1') setDialogOpen(true);
  }

  // Strips the `new` param once it has been read above - a router call, not a setState, so a
  // refresh of the resulting plain /bookings URL never reopens the dialog.
  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    const query = next.toString();
    router.replace(query ? `/bookings?${query}` : '/bookings');
  }, [searchParams, router]);

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

  // ADR-024: a waitlist row may be promoted only while its session currently has a free seat.
  // Recomputed from the live ledger on every bookings/sessions change, so cancelling a booking on
  // a full session with people waiting turns this on for that session's rows immediately - the
  // visible sign a seat opened, no separate flag to keep in sync.
  const promotableSessionIds = useMemo(() => {
    const bookingsBySession = indexBookingsBySession(bookings);
    const ids = new Set<string>();
    for (const session of sessions) {
      const occupancy = selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? []);
      if (occupancy.available > 0) ids.add(session.id);
    }
    return ids;
  }, [bookings, sessions]);

  function handleTabChange(tab: BookingsTabKey) {
    setFilters((prev) => ({ ...prev, status: tab }));
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    const result = await useBookingStore.getState().cancelBooking(cancelTarget.id, { override: true });
    if (!result.ok) {
      toast.error(m.bookings.promotionRejectionReason(result.reason));
      // ConfirmDialog's contract (src/components/shared/confirm-dialog.tsx): a thrown onConfirm
      // keeps the dialog open instead of closing on a rejection it never explains itself.
      throw new Error(result.reason);
    }
    toast.success(m.bookings.toastCancelled);
  }

  // Direct action, no confirm dialog (ADR-024: promotion is not destructive) - still surfaces a
  // rejection via toast rather than leaving an enabled control doing nothing (ADR-024 point 2).
  async function handlePromote(row: BookingRow) {
    setPromotingId(row.id);
    try {
      const result = await useBookingStore.getState().promoteFromWaitlist(row.id);
      if (!result.ok) {
        // PromoteActionResult (src/stores/booking.store.ts, not owned by this namespace) does
        // not carry `limit` even though selectPromotionEligibility can compute one for
        // 'daily_limit_reached' - the toast falls back to the reason's generic wording rather
        // than fabricating a count.
        toast.error(m.bookings.promotionRejectionReason(result.reason));
        return;
      }
      toast.success(m.bookings.toastPromoted(row.customer.name));
    } finally {
      setPromotingId(null);
    }
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.bookings.title} subtitle={m.bookings.subtitle} />
        <SectionCard title={m.bookings.allBookings}>
          <ErrorState onRetry={() => void useDemoRuntimeStore.getState().retryHydration()} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={m.bookings.title}
        subtitle={m.bookings.subtitle}
        actions={
          <Button type="button" variant="ink" onClick={() => setDialogOpen(true)}>
            {m.bookings.newBooking}
          </Button>
        }
      />

      <SectionCard title={m.bookings.allBookings}>
        {status !== 'ready' || isSimulatedLoading ? (
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
                  {m.bookings.filteredToSession(
                    filteredSession
                      ? `${filteredSession.classType.name} · ${formatDisplayDateShort(filteredSession.date)} · ${formatDisplayTime(filteredSession.startTime)}`
                      : sessionFilter.sessionId,
                  )}
                </span>
                <Button type="button" variant="ghost" onClick={sessionFilter.clear} className="ml-auto h-7 shrink-0 px-2 text-purple-deep hover:bg-purple-soft">
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                  {m.bookings.clear}
                </Button>
              </div>
            ) : null}
            <StatusTabs value={filters.status} onValueChange={handleTabChange} counts={tabCounts} />
            <BookingsTable
              rows={sessionFilter.rows}
              onCancelRequest={setCancelTarget}
              onCreateBooking={() => setDialogOpen(true)}
              onPromoteRequest={handlePromote}
              promotableSessionIds={promotableSessionIds}
              promotingId={promotingId}
            />
          </div>
        )}
      </SectionCard>

      <BookingDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title={m.bookings.cancelDialog.title}
        description={
          cancelTarget
            ? m.bookings.cancelDialog.description(
                cancelTarget.customer.name,
                cancelTarget.classType.name,
                formatDisplayDateShort(cancelTarget.session.date),
              )
            : undefined
        }
        confirmLabel={m.bookings.cancelDialog.confirmLabel}
        destructive
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
