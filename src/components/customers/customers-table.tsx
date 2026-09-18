'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4: wraps DataTable<CustomerWithStats> with the
// master plan section 25 column set (avatar + name are rendered together inside one "Customer"
// cell, matching how src/app/design-system/_components/data-surfaces-section.tsx's own table
// reference and docs/06 section 3.4's bookings table both bundle a row's avatar with its name
// rather than giving the avatar a separate header). DataTable owns pagination/mobile switching;
// this file only supplies columns, the empty state and the row->detail navigation.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { AvatarBlobatar } from '@/components/ui/avatar';
import type { CustomerWithStats } from '@/domain/types';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useMessages } from '@/hooks/use-messages';
import { accentForCustomerId, paletteForAccent } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import type { Messages } from '@/i18n/messages';

export interface CustomersTableProps {
  rows: CustomerWithStats[];
}

// Every seeded person is "Customer NN" (privacy rule, docs/04 section 2) - same convention as
// shared/avatar-group.tsx's own private initialsFor, reimplemented here because this cell needs
// a single bare avatar+name, not that component's overlapping-group layout.
function initialsFor(name: string): string {
  const trailingNumber = /(\d{1,2})\s*$/.exec(name.trim());
  return trailingNumber ? trailingNumber[1].padStart(2, '0') : name.trim().slice(0, 2).toUpperCase();
}

function CustomerCell({ customer }: { customer: CustomerWithStats }) {
  return (
    // onDragStart: a plain <img> is natively draggable, so a mouse-down that drifts even a
    // couple of pixels before mouse-up on the avatar starts a native browser drag instead of a
    // click - the row's onClick (DataTable) never fires, and it takes a second, stiller click to
    // open the profile. Blocking dragstart here (it bubbles up from the <img>) keeps the row a
    // reliable one-click target without touching the shared DataTable/Avatar primitives.
    <div className="flex items-center gap-2.5" onDragStart={(event) => event.preventDefault()}>
      <AvatarBlobatar
        seed={customer.id}
        palette={paletteForAccent(accentForCustomerId(customer.id))}
        size={32}
        alt={customer.name}
        fallbackInitials={initialsFor(customer.name)}
      />
      <span className="text-sm font-medium text-ink">{customer.name}</span>
    </div>
  );
}

// Columns depend on the active locale (header text, the localized short date), so they are
// built inside the component rather than as a module-level const - unlike columns arrays in
// namespaces that are still plain English.
function buildColumns(
  m: Messages,
  formatDisplayDateShort: (date: string) => string,
): DataTableColumn<CustomerWithStats>[] {
  return [
    { id: 'customer', header: m.customers.table.customer, cell: (row) => <CustomerCell customer={row} /> },
    { id: 'membership', header: m.customers.table.membership, cell: (row) => row.membership.name },
    {
      id: 'lastVisit',
      header: m.customers.table.lastVisit,
      cell: (row) => (
        <span className="tabular-nums">{row.lastVisit ? formatDisplayDateShort(row.lastVisit) : m.customers.table.never}</span>
      ),
    },
    {
      id: 'classesThisMonth',
      header: m.customers.table.classesThisMonth,
      cell: (row) => <span className="tabular-nums">{row.classesThisMonth}</span>,
    },
    {
      id: 'status',
      header: m.customers.table.status,
      cell: (row) => <StatusBadge status={row.status} label={m.customers.status[row.status]} />,
      className: 'text-right',
    },
  ];
}

// docs/06 section 3.5 responsive table: "390 px: table cards show Avatar + Customer + Status
// only, remaining fields inside an expandable row." Local expand/collapse state per card - each
// DataTable page renders at most `pageSize` of these, well under the ~20-item memo threshold in
// docs/08-STATE-MANAGEMENT.md section 6 point 4.
function CustomerMobileCard({
  customer,
  onOpen,
  m,
  formatDisplayDateShort,
}: {
  customer: CustomerWithStats;
  onOpen: () => void;
  m: Messages;
  formatDisplayDateShort: (date: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-4">
      {/* onDragStart: see CustomerCell above - the same native image-drag can swallow a tap/click
          that starts on this avatar. */}
      <button
        type="button"
        onClick={onOpen}
        onDragStart={(event) => event.preventDefault()}
        className="flex items-center gap-3 text-left"
      >
        <AvatarBlobatar
          seed={customer.id}
          palette={paletteForAccent(accentForCustomerId(customer.id))}
          size={32}
          alt={customer.name}
          fallbackInitials={initialsFor(customer.name)}
        />
        <span className="flex-1 text-sm font-medium text-ink">{customer.name}</span>
        <StatusBadge status={customer.status} label={m.customers.status[customer.status]} />
      </button>

      {/* -mx-1 offsets the added horizontal padding so the label still lines up with the row
          above it; py-3 (added rather than negative vertical margin, which would eat into the
          parent's flex `gap-3` and overlap the neighbouring rows) brings this to the 40px minimum
          tap target docs/03 section 16 requires below md - at 16px of text-only hit area this
          was well under it. */}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="-mx-1 flex items-center gap-1 self-start rounded-field px-1 py-3 text-xs font-semibold text-text-tertiary"
      >
        {expanded ? m.customers.table.hideDetails : m.customers.table.showDetails}
        {expanded ? <ChevronUp aria-hidden="true" className="h-3.5 w-3.5" /> : <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />}
      </button>

      <div className={cn('flex-col gap-2 border-t border-border pt-3 text-sm', expanded ? 'flex' : 'hidden')}>
        <div className="flex items-center justify-between">
          <span className="text-text-tertiary">{m.customers.table.membership}</span>
          <span className="text-ink">{customer.membership.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-tertiary">{m.customers.table.lastVisit}</span>
          <span className="tabular-nums text-ink">
            {customer.lastVisit ? formatDisplayDateShort(customer.lastVisit) : m.customers.table.never}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-tertiary">{m.customers.table.classesThisMonth}</span>
          <span className="tabular-nums text-ink">{customer.classesThisMonth}</span>
        </div>
      </div>
    </div>
  );
}

export function CustomersTable({ rows }: CustomersTableProps) {
  const router = useRouter();
  const m = useMessages();
  const { formatDisplayDateShort } = useDateLocale();
  const columns = useMemo(() => buildColumns(m, formatDisplayDateShort), [m, formatDisplayDateShort]);

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      pageSize={15}
      onRowClick={(row) => router.push(`/customers/${row.id}`)}
      renderMobileCard={(row) => (
        <CustomerMobileCard
          customer={row}
          onOpen={() => router.push(`/customers/${row.id}`)}
          m={m}
          formatDisplayDateShort={formatDisplayDateShort}
        />
      )}
      emptyState={<EmptyState icon={Users} title={m.customers.table.emptyTitle} description={m.customers.table.emptyDescription} />}
    />
  );
}
