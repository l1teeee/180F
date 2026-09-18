// master plan section 26 (Customer Detail: header with avatar/"Customer XX"/status; stats
// classes-this-month/attendance-rate/no-shows/favorite-class; recent activity timeline).
// Used by e2e/04-customer-detail.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class CustomerDetailPage {
  readonly page: Page;
  readonly nameHeading: Locator;
  readonly membershipText: Locator;
  readonly attendanceRateStat: Locator;
  readonly activityTimeline: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameHeading = page.getByRole('heading', { name: /customer \d+/i });
    this.membershipText = page.getByText(/membership/i).first();
    this.attendanceRateStat = page.getByRole('group', { name: /attendance rate/i });
    this.activityTimeline = page.getByRole('region', { name: /recent activity/i });
  }
}
