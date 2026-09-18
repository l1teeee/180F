'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4: "Table columns: Customer, Class, Instructor, Date,
// Time, Source, Status." Built on the shared DataTable (pagination + the below-md card list come
// from there, docs/07-COMPONENT-ARCHITECTURE.md section 4) - this file only supplies columns.
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SourceBadge } from '@/components/shared/source-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import type { BookingRow } from '@/domain/types';
import { formatDisplayDateShort, formatDisplayTime } from '@/lib/dates';

export interface BookingsTableProps {
  rows: BookingRow[];
  onCancelRequest: (row: BookingRow) => void;
  onCreateBooking: () => void;
}

const COLUMNS: DataTableColumn<BookingRow>[] = [
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
  { id: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
];

// Below md the desktop table's seven columns plus an actions cell would either force horizontal
// scroll or repeat as an ungainly seven-row label/value list (DataTable's generic fallback card) -
// same composed-card shape as dashboard/recent-bookings-table.tsx's mobile card: identity + status
// on one row, class + date/time on the next, source and the cancel action on a third.
function BookingMobileCard({ row, onCancelRequest }: { row: BookingRow; onCancelRequest: (row: BookingRow) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarGroup people={[{ id: row.customer.id, name: row.customer.name, avatar: row.customer.avatar }]} max={1} size={32} />
          <span className="truncate text-[15px] font-semibold text-ink">{row.customer.name}</span>
        </div>
        <StatusBadge status={row.status} />
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
  );
}

export function BookingsTable({ rows, onCancelRequest, onCreateBooking }: BookingsTableProps) {
  // A trailing, header-less actions column - not one of the seven data fields docs/06 lists, but
  // the acceptance criteria (task brief) explicitly requires a working cancel affordance
  // somewhere on this screen, and this is the only row-scoped one anywhere in the layout.
  const columns: DataTableColumn<BookingRow>[] = [
    ...COLUMNS,
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) =>
        row.status === 'cancelled' ? null : (
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
        ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      renderMobileCard={(row) => <BookingMobileCard row={row} onCancelRequest={onCancelRequest} />}
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
