// master plan section 23 (Bookings Module: Search, Status filter, Date filter, Source filter,
// New booking, tabs All/Confirmed/Pending/Cancelled/Waitlist, table columns Customer/Class/
// Instructor/Date/Time/Source/Status). Used by e2e/02-new-booking.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly dateFilter: Locator;
  readonly sourceFilter: Locator;
  readonly newBookingButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox');
    this.statusFilter = page.getByRole('combobox', { name: /status/i });
    this.dateFilter = page.getByRole('combobox', { name: /date/i });
    this.sourceFilter = page.getByRole('combobox', { name: /source/i });
    this.newBookingButton = page.getByRole('button', { name: /new booking/i });
    this.table = page.getByRole('table', { name: /bookings/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/bookings');
  }

  tab(name: 'All' | 'Confirmed' | 'Pending' | 'Cancelled' | 'Waitlist'): Locator {
    return this.page.getByRole('tab', { name, exact: true });
  }

  rowByCustomerName(name: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(name) });
  }

  async rowCount(): Promise<number> {
    return this.table.getByRole('row').count();
  }
}
