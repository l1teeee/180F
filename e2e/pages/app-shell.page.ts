// docs/CLAUDE.md "Routes" and master plan section 15 (App Shell / Sidebar). One row per sidebar
// nav item; `ADMIN_ROUTES` is also what e2e/07-admin-nav-smoke.spec.ts iterates over, so the
// name here must match the link's accessible name exactly once the sidebar exists.
import type { Locator, Page } from '@playwright/test';

export const ADMIN_ROUTES: ReadonlyArray<{ name: string; path: string }> = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Bookings', path: '/bookings' },
  { name: 'Customers', path: '/customers' },
  { name: 'Classes', path: '/classes' },
  { name: 'Instructors', path: '/instructors' },
  { name: 'Memberships', path: '/memberships' },
  { name: 'Automations', path: '/automations' },
  { name: 'Settings', path: '/settings' },
];

export class AppShellPage {
  readonly page: Page;
  readonly globalSearchInput: Locator;
  readonly notificationsButton: Locator;
  readonly helpButton: Locator;
  readonly profileMenuButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.globalSearchInput = page.getByRole('searchbox', { name: /search customers, classes/i });
    this.notificationsButton = page.getByRole('button', { name: /notifications/i });
    this.helpButton = page.getByRole('button', { name: /help/i });
    this.profileMenuButton = page.getByRole('button', { name: /administrator|profile/i });
    this.logoutButton = page.getByRole('button', { name: /log ?out/i });
  }

  navLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async goTo(name: string): Promise<void> {
    await this.navLink(name).click();
  }
}
