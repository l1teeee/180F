// docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from './data-table';

interface Row {
  id: string;
  name: string;
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({ id: `row-${i}`, name: `Row ${i}` }));
}

const columns: DataTableColumn<Row>[] = [{ id: 'name', header: 'Name', cell: (row) => row.name }];

describe('DataTable pagination', () => {
  it('renders only the current page row count in the desktop table', () => {
    const rows = makeRows(25);
    render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />);
    const table = screen.getByRole('table');
    // 1 header row + 10 body rows (default pageSize)
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    expect(within(table).getByText('Row 0')).toBeInTheDocument();
    expect(within(table).queryByText('Row 10')).not.toBeInTheDocument();
  });

  it('page-forward and page-back controls change the visible rows', async () => {
    const user = userEvent.setup();
    const rows = makeRows(25);
    render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />);
    const table = screen.getByRole('table');

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(within(table).getByText('Row 10')).toBeInTheDocument();
    expect(within(table).queryByText('Row 0')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(within(table).getByText('Row 0')).toBeInTheDocument();
    expect(within(table).queryByText('Row 10')).not.toBeInTheDocument();
  });

  it('disables "Previous page" on the first page and "Next page" on the last page', async () => {
    const user = userEvent.setup();
    const rows = makeRows(15); // 2 pages at the default pageSize of 10
    render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('does not mutate or reorder the source rows array when paging', async () => {
    const user = userEvent.setup();
    const rows = makeRows(25);
    const snapshot = rows.map((row) => ({ ...row }));
    render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(rows).toEqual(snapshot);
  });

  it('renders the empty state when there are no rows', () => {
    render(<DataTable rows={[]} columns={columns} rowKey={(row) => row.id} emptyState={<p>No results</p>} />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders nothing when there are no rows and no emptyState is given', () => {
    const { container } = render(<DataTable rows={[]} columns={columns} rowKey={(row) => row.id} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('DataTable mobile card renderer', () => {
  it('uses the default mobile card renderer when none is supplied', () => {
    const rows = makeRows(2);
    const { container } = render(<DataTable rows={rows} columns={columns} rowKey={(row) => row.id} onRowClick={() => {}} />);
    const mobileContainer = container.querySelector('[class*="md:hidden"]');
    expect(mobileContainer).not.toBeNull();
    // The default card exposes each row as a keyboard-operable button when onRowClick is given.
    expect(within(mobileContainer as HTMLElement).getAllByRole('button')).toHaveLength(2);
  });

  it('switches to the caller-supplied mobile card renderer instead of the default one', () => {
    const rows = makeRows(2);
    render(
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        onRowClick={() => {}}
        renderMobileCard={(row) => <div data-testid="custom-mobile-card">{row.name}</div>}
      />,
    );
    expect(screen.getAllByTestId('custom-mobile-card')).toHaveLength(2);
    // The default card's button role must not also be rendered alongside the custom one.
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
