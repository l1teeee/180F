// docs/07-COMPONENT-ARCHITECTURE.md section 3 "RecentBookingsTable": wraps DataTable<BookingRow>
// for the dashboard's recent-bookings panel. Columns per master plan section 21: Customer,
// Class, Date, Time, Source, Status - StatusBadge/SourceBadge read the one status->colour map
// (docs/07 section 7 anti-patterns), never a second one defined here.
import { AvatarGroup } from '@/components/shared/avatar-group';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SourceBadge } from '@/components/shared/source-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import type { BookingRow } from '@/domain/types';
import { formatDisplayDateShort, formatDisplayTime } from '@/lib/dates';

export interface RecentBookingsTableProps {
  rows: BookingRow[];
}

const COLUMNS: DataTableColumn<BookingRow>[] = [
  {
    id: 'customer',
    header: 'Customer',
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <AvatarGroup people={[{ id: row.customer.id, name: row.customer.name, avatar: row.customer.avatar }]} max={1} size={32} />
        <span className="font-medium text-ink">{row.customer.name}</span>
      </div>
    ),
  },
  { id: 'class', header: 'Class', cell: (row) => row.classType.name },
  { id: 'date', header: 'Date', cell: (row) => formatDisplayDateShort(row.session.date), className: 'tabular-nums' },
  { id: 'time', header: 'Time', cell: (row) => formatDisplayTime(row.session.startTime), className: 'tabular-nums' },
  { id: 'source', header: 'Source', cell: (row) => <SourceBadge source={row.source} /> },
  { id: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
];

function RecentBookingMobileCard({ row }: { row: BookingRow }) {
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
        <span className="truncate">{row.classType.name}</span>
        <span className="shrink-0 tabular-nums">
          {formatDisplayDateShort(row.session.date)} · {formatDisplayTime(row.session.startTime)}
        </span>
      </div>
      <SourceBadge source={row.source} />
    </div>
  );
}

export function RecentBookingsTable({ rows }: RecentBookingsTableProps) {
  return (
    <DataTable
      rows={rows}
      columns={COLUMNS}
      rowKey={(row) => row.id}
      renderMobileCard={(row) => <RecentBookingMobileCard row={row} />}
      emptyState={<EmptyState title="No bookings yet" description="Bookings made today will show up here." />}
    />
  );
}
