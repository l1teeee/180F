// master plan section 26 (Customer Detail: header with avatar/"Customer XX"/status; stats
// classes-this-month/attendance-rate/no-shows/favorite-class; recent activity timeline).
// Used by e2e/04-customer-detail.spec.ts.
import type { Locator, Page } from '@playwright/test';
import { statCardValue } from './stat-card';

export class CustomerDetailPage {
  readonly page: Page;
  readonly nameHeading: Locator;
  readonly membershipText: Locator;
  readonly activityTimeline: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameHeading = page.getByRole('heading', { name: /customer \d+/i, level: 2 });
    this.membershipText = page.getByText('Membership', { exact: true }).first();
    // ActivityTimeline (src/components/customers/activity-timeline.tsx) renders a real <ul>,
    // but it is the SECOND one on the page - the first is the membership card's own one-item
    // benefits list (src/components/customers/customer-profile.tsx) - verified live.
    this.activityTimeline = page.getByRole('list').last();
  }

  async attendanceRateValue(): Promise<number> {
    return statCardValue(this.page, 'Attendance rate');
  }
}
