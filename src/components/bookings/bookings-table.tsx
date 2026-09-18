'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4: "Table columns: Customer, Class, Instructor, Date,
// Time, Source, Status." Built on the shared DataTable (pagination + the below-md card list come
// from there, docs/07-COMPONENT-ARCHITECTURE.md section 4) - this file only supplies columns.
import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SourceBadge } from '@/components/shared/source-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { selectPromotionEligibility, type PromotionEligibility } from '@/domain/selectors';
import type { BookingRow } from '@/domain/types';
import { formatDisplayDateShort, formatDisplayTime } from '@/lib/dates';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';
import { useSettingsStore } from '@/stores/settings.store';

export interface BookingsTableProps {
  rows: BookingRow[];
  onCancelRequest: (row: BookingRow) => void;
  onCreateBooking: () => void;
  onPromoteRequest: (row: BookingRow) => void;
  // Superseded by usePromotionEligibilityByRow below (ADR-024 point 3: promotion must satisfy
  // the same conditions as creating a confirmed booking, not capacity alone) - kept in the props
  // contract unread so this file's caller does not have to change.
  promotableSessionIds: ReadonlySet<string>;
  // The booking id currently mid-promotion, so its row's control shows it is busy and cannot be
  // double-clicked (docs/08 section 8.1 style, mirrored at the row level for this action).
  promotingId: string | null;
}

const DEFAULT_PROMOTE_TITLE = 'This booking cannot be promoted yet.';

// A waitlisted row may be promoted only while it would also be accepted as a brand-new confirmed
// booking (ADR-024 point 3) - session not cancelled or started, a free seat, no other active
// booking for this customer/session, within the daily limit. Reads the stores directly (rather
// than taking the ledger/settings/clock as props) so this is the one place, alongside
// promoteFromWaitlist itself, that computes it - both call the same selectPromotionEligibility,
// so a disabled button and a rejected click can never disagree (mirrors the existing contract
// documented on selectBookingEligibility for booking creation).
function usePromotionEligibilityByRow(rows: BookingRow[]): Map<string, PromotionEligibility> {
  const bookings = useBookingStore((state) => state.bookings);
  const sessions = useSessionStore((state) => state.sessions);
  const settings = useSettingsStore((state) => state.settings);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);

  return useMemo(() => {
    const eligibilityByBookingId = new Map<string, PromotionEligibility>();
    if (!settings || !demoNow) return eligibilityByBookingId;
    for (const row of rows) {
      if (row.status !== 'waitlist') continue;
      eligibilityByBookingId.set(
        row.id,
        selectPromotionEligibility({
          bookingId: row.id,
          bookingStatus: row.status,
          session: row.session,
          customer: row.customer,
          bookings,
          sessions,
          settings,
          demoNow,
        }),
      );
    }
    return eligibilityByBookingId;
  }, [rows, bookings, sessions, settings, demoNow]);
}

const BASE_COLUMNS: DataTableColumn<BookingRow>[] = [
  {
    id: 'customer',
    header: 'Customer',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <AvatarGroup people={[{ id: row.customer.id, name: row.customer.name, avatar: row.customer.avatar }]} max={1} size={32} />
        <span className="font-medium text-ink">{row.customer.name}</span>
      </div>
    ),
  },
  { id: 'class', header: 'Class', cell: (row) => row.classType.name },
  { id: 'instructor', header: 'Instructor', cell: (row) => row.instructor.name },
  { id: 'date', header: 'Date', cell: (row) => formatDisplayDateShort(row.session.date) },
  { id: 'time', header: 'Time', cell: (row) => formatDisplayTime(row.session.startTime) },
  { id: 'source', header: 'Source', cell: (row) => <SourceBadge source={row.source} /> },
];

interface PromoteButtonProps {
  row: BookingRow;
  canPromote: boolean;
  title: string;
  promoting: boolean;
  onPromoteRequest: (row: BookingRow) => void;
}

// Disabled whenever selectPromotionEligibility refuses it, with `title` stating why (ADR-024
// point 2: a control that can be refused must either explain itself disabled or accept the click
// and report the outcome) - not capacity alone.
function PromoteButton({ row, canPromote, title, promoting, onPromoteRequest }: PromoteButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={!canPromote || promoting}
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onPromoteRequest(row);
      }}
    >
      Promote
    </Button>
  );
}

// Below md the desktop table's columns plus an actions cell would either force horizontal scroll
// or repeat as an ungainly label/value list (DataTable's generic fallback card) - same composed-
// card shape as dashboard/recent-bookings-table.tsx's mobile card: identity + status on one row,
// class + date/time on the next, source and the row actions on a third.
function BookingMobileCard({
  row,
  canPromote,
  promoteTitle,
  promoting,
  onCancelRequest,
  onPromoteRequest,
}: {
  row: BookingRow;
  canPromote: boolean;
  promoteTitle: string;
  promoting: boolean;
  onCancelRequest: (row: BookingRow) => void;
  onPromoteRequest: (row: BookingRow) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarGroup people={[{ id: row.customer.id, name: row.customer.name, avatar: row.customer.avatar }]} max={1} size={32} />
          <span className="truncate text-[15px] font-semibold text-ink">{row.customer.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge status={row.status} />
          {row.status === 'waitlist' && canPromote ? <Badge variant="positive">Seat open</Badge> : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-text-secondary">
        <span className="truncate">
          {row.classType.name} · {row.instructor.name}
        </span>
        <span className="shrink-0 tabular-nums">
          {formatDisplayDateShort(row.session.date)} · {formatDisplayTime(row.session.startTime)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <SourceBadge source={row.source} />
        <div className="flex items-center gap-2">
          {row.status === 'waitlist' ? (
            <PromoteButton
              row={row}
              canPromote={canPromote}
              title={promoteTitle}
              promoting={promoting}
              onPromoteRequest={onPromoteRequest}
            />
          ) : null}
          {row.status !== 'cancelled' ? (
            <Button
              type="button"
              variant="icon"
              aria-label={`Cancel booking for ${row.customer.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onCancelRequest(row);
              }}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BookingsTable({
  rows,
  onCancelRequest,
  onCreateBooking,
  onPromoteRequest,
  promotingId,
}: BookingsTableProps) {
  const eligibilityByBookingId = usePromotionEligibilityByRow(rows);
  const canPromoteRow = (row: BookingRow) => eligibilityByBookingId.get(row.id)?.allowed === true;
  const promoteTitleFor = (row: BookingRow) => {
    const eligibility = eligibilityByBookingId.get(row.id);
    if (!eligibility) return DEFAULT_PROMOTE_TITLE;
    return eligibility.allowed ? 'Promote to confirmed' : eligibility.message;
  };

  // Status and actions stay out of BASE_COLUMNS above because both need per-row eligibility -
  // the "Seat open" signal (status cell) and the Promote control's enabled state (actions cell)
  // are the same fact, read once per row.
  const columns: DataTableColumn<BookingRow>[] = [
    ...BASE_COLUMNS,
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const canPromote = row.status === 'waitlist' && canPromoteRow(row);
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={row.status} />
            {canPromote ? <Badge variant="positive">Seat open</Badge> : null}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => {
        if (row.status === 'cancelled') return null;
        const canPromote = row.status === 'waitlist' && canPromoteRow(row);
        const promoting = promotingId === row.id;
        return (
          <div className="flex items-center justify-end gap-2">
            {row.status === 'waitlist' ? (
              <PromoteButton
                row={row}
                canPromote={canPromote}
                title={promoteTitleFor(row)}
                promoting={promoting}
                onPromoteRequest={onPromoteRequest}
              />
            ) : null}
            <Button
              type="button"
              variant="icon"
              aria-label={`Cancel booking for ${row.customer.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onCancelRequest(row);
              }}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      renderMobileCard={(row) => (
        <BookingMobileCard
          row={row}
          canPromote={row.status === 'waitlist' && canPromoteRow(row)}
          promoteTitle={promoteTitleFor(row)}
          promoting={promotingId === row.id}
          onCancelRequest={onCancelRequest}
          onPromoteRequest={onPromoteRequest}
        />
      )}
      emptyState={
        <EmptyState
          title="No bookings found"
          description="Try changing your filters or create a new booking."
          action={{ label: 'Create booking', onClick: onCreateBooking }}
        />
      }
    />
  );
}
