// master plan section 23 (Bookings Module: Search, Status filter, Date filter, Source filter,
// New booking, tabs All/Confirmed/Pending/Cancelled/Waitlist, table columns Customer/Class/
// Instructor/Date/Time/Source/Status). Used by e2e/02-new-booking.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly sourceFilter: Locator;
  readonly dateFilter: Locator;
  readonly newBookingButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    // A plain type="text" input (not type="search"), so its role is "textbox"; its accessible
    // name comes from the placeholder (no separate label exists) - verified live.
    this.searchInput = page.getByRole('textbox', { name: /search by customer/i });
    this.statusFilter = page.getByRole('combobox', { name: /filter by status/i });
    this.sourceFilter = page.getByRole('combobox', { name: /filter by source/i });
    // A native <input type="date"> (BookingFiltersBar), not a combobox - getByLabel matches its
    // aria-label regardless of the browser's own spinbutton-group rendering of it.
    this.dateFilter = page.getByLabel(/filter by date/i);
    // Two "New booking" buttons exist on this page: the sidebar's documented no-op
    // (src/components/layout/app-sidebar.tsx) and this page's own PageHeader action, which is
    // wired to the real dialog. Scoping to <main> picks the working one unambiguously.
    this.newBookingButton = page.getByRole('main').getByRole('button', { name: /^new booking$/i });
    this.table = page.getByRole('table');
  }

  async goto(): Promise<void> {
    await this.page.goto('/bookings');
  }

  /** Each tab's accessible name is "<name> <count>" (StatusTabs) - the count changes every
   * run, so match the name as a leading word rather than requiring an exact string. */
  tab(name: 'All' | 'Confirmed' | 'Pending' | 'Cancelled' | 'Waitlist'): Locator {
    return this.page.getByRole('tab', { name: new RegExp(`^${name}\\b`) });
  }

  rowByCustomerName(name: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(name) });
  }

  async rowCount(): Promise<number> {
    return this.table.getByRole('row').count();
  }
}
