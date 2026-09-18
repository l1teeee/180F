// master plan section 17 (KPI cards: Active members, Today bookings, Occupancy, Today's
// classes) and section 18/19/20/21 (weekly chart, class occupancy, upcoming classes, recent
// bookings). Used by e2e/01-login-to-dashboard.spec.ts and e2e/02-new-booking.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly weeklyBookingsChart: Locator;
  readonly classOccupancySection: Locator;
  readonly upcomingClassesSection: Locator;
  readonly recentBookingsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /good morning/i });
    this.weeklyBookingsChart = page.getByRole('region', { name: /weekly bookings/i });
    this.classOccupancySection = page.getByRole('region', { name: /class occupancy/i });
    this.upcomingClassesSection = page.getByRole('region', { name: /upcoming classes/i });
    this.recentBookingsSection = page.getByRole('region', { name: /recent bookings/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /** One of "Active members" | "Today bookings" | "Occupancy" | "Today's classes". */
  kpiCard(label: string): Locator {
    return this.page.getByRole('group', { name: new RegExp(label, 'i') });
  }

  async kpiValueText(label: string): Promise<string> {
    return (await this.kpiCard(label).textContent()) ?? '';
  }
}
