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
