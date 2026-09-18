'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4: a generic table that renders the rows it is
// given and owns only pagination-through-the-given-set and the mobile/desktop render switch -
// it never filters, sorts, or paginates server-side (that is the caller's hook/selector's job,
// per docs/08-STATE-MANAGEMENT.md section 4 and the anti-pattern in docs/07 section 7).
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';

export interface DataTableColumn<Row> {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
}

export interface DataTableProps<Row> {
  rows: Row[]; // already filtered by the caller's hook/selector
  columns: DataTableColumn<Row>[];
  rowKey: (row: Row) => string;
  pageSize?: number; // default 10, client-side pagination
  renderMobileCard?: (row: Row) => ReactNode; // used below md, per docs/03 section 14
  emptyState?: ReactNode;
  onRowClick?: (row: Row) => void;
}

function DefaultMobileCard<Row>({
  row,
  columns,
  onClick,
}: {
  row: Row;
  columns: DataTableColumn<Row>[];
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'flex flex-col gap-2 rounded-card-sm border border-border bg-surface p-4',
        onClick && 'cursor-pointer transition-colors duration-[var(--duration-fast)] ease-out hover:bg-surface-muted',
      )}
    >
      {columns.map((column) => (
        <div key={column.id} className="flex items-center justify-between gap-3 text-sm">
          <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{column.header}</span>
          <span className={cn('text-right text-ink', column.className)}>{column.cell(row)}</span>
        </div>
      ))}
    </div>
  );
}

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  pageSize = 10,
  renderMobileCard,
  emptyState,
  onRowClick,
}: DataTableProps<Row>) {
  const [page, setPage] = useState(0);

  if (rows.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  // A row mutating in place (e.g. a row action like cancel) gives `rows` a new identity on every
  // render without necessarily changing how many pages exist - clamping (rather than forcing
  // page back to 0 whenever `rows` changes at all) is what keeps the user on their current page
  // unless it no longer exists, e.g. the caller's filters/search shrinking the set out from
  // under it.
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {pageRows.map((row) =>
          renderMobileCard ? (
            <div key={rowKey(row)}>{renderMobileCard(row)}</div>
          ) : (
            <DefaultMobileCard key={rowKey(row)} row={row} columns={columns} onClick={onRowClick ? () => onRowClick(row) : undefined} />
          ),
        )}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm text-text-secondary">
            Page <span className="tabular-nums text-ink">{clampedPage + 1}</span> of{' '}
            <span className="tabular-nums text-ink">{pageCount}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="icon"
              aria-label="Previous page"
              disabled={clampedPage === 0}
              onClick={() => setPage(clampedPage - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="icon"
              aria-label="Next page"
              disabled={clampedPage >= pageCount - 1}
              onClick={() => setPage(clampedPage + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
