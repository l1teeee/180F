// docs/CLAUDE.md "Routes" and master plan section 15 (App Shell / Sidebar). One row per sidebar
// nav item; `ADMIN_ROUTES` is also what e2e/07-admin-nav-smoke.spec.ts iterates over.
//
// The sidebar's own "New booking" button (src/components/layout/app-sidebar.tsx) is a
// documented no-op (`function handleNewBooking() {}` there) - it is deliberately not exposed
// here, so a spec cannot accidentally rely on it. Each admin page's own "New booking" affordance
// (e.g. BookingsPage.newBookingButton) is the wired one.
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
    this.globalSearchInput = page.getByRole('textbox', { name: /search customers, classes/i });
    this.notificationsButton = page.getByRole('button', { name: /notifications/i });
    this.helpButton = page.getByRole('button', { name: /^help$/i });
    // The top bar no longer carries an account menu (it lives only on the rail/drawer now), so
    // there is a single "Account menu" button and no landmark scoping is needed to disambiguate.
    this.profileMenuButton = page.getByRole('button', { name: /account menu/i });
    this.logoutButton = page.getByRole('menuitem', { name: /log ?out/i });
  }

  navLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  /** Client-side navigation via the real sidebar link - never page.goto(), which would force a
   * full reload and silently reset the in-memory demo dataset (ADR-005). */
  async goTo(name: string): Promise<void> {
    await this.navLink(name).click();
  }
}
