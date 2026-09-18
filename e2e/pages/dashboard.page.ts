// master plan section 17 (KPI cards: Active members, Today's bookings, Occupancy, Today's
// classes). Used by e2e/01-login-to-dashboard.spec.ts and e2e/02-new-booking.spec.ts.
//
// StatCard (src/components/shared/stat-card.tsx) renders no ARIA role or group of its own -
// verified against a live a11y snapshot, see e2e/pages/stat-card.ts - so KPI values are read
// through that shared helper rather than a role('group') locator that does not exist in the
// real DOM.
import type { Locator, Page } from '@playwright/test';
import { statCardValue } from './stat-card';

// Exact label text as rendered by src/app/(admin)/dashboard/page.tsx.
export const DASHBOARD_KPI_LABELS = ['Active members', "Today's bookings", 'Occupancy', "Today's classes"] as const;

export type DashboardKpiLabel = (typeof DASHBOARD_KPI_LABELS)[number];

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /good morning/i, level: 1 });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async kpiValue(label: DashboardKpiLabel): Promise<number> {
    return statCardValue(this.page, label);
  }
}
