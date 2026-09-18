// ADR-022 (docs/13-DECISIONS.md) + master plan section 61 steps 13-17: the demo's climax is
// booking on the phone and showing it reflected in the admin, which a full navigation or a
// second tab used to silently defeat (every store lived in memory only). These specs fail
// against the pre-ADR-022 code and pass once hydrateDemo restores a localStorage snapshot and
// other tabs pick it up via the `storage` event.
import { format } from 'date-fns';
import { test, expect } from './fixtures/auth';
import { withHydrationAwareGoto } from './fixtures/hydration';
import { AppShellPage } from './pages/app-shell.page';
import { BookingDialogPage } from './pages/booking-dialog.page';
import { BookingsPage } from './pages/bookings.page';
import { DashboardPage } from './pages/dashboard.page';
import { PublicBookingWizardPage } from './pages/public-booking-wizard.page';

const TODAY_LABEL = format(new Date(), 'MMM d, yyyy'); // matches DISPLAY_DATE_FORMAT

// Any of these that has not already hit the seed's own maxReservationsPerDay for today works -
// selectFirstOpenSessionOnDate already backtracks across class types for a non-full slot, but a
// customer who happens to already have 2 bookings today is rejected regardless of which slot is
// picked (selectBookingEligibility's daily-cap check), so this tries a few customers in turn
// rather than trusting one fixed name to always be eligible on any given day.
const CANDIDATE_CUSTOMERS = ['Customer 01', 'Customer 02', 'Customer 03', 'Customer 04', 'Customer 05'] as const;

/**
 * Creates one CONFIRMED (never waitlisted - ADR-023 excludes the waitlist from the "Today's
 * bookings" KPI) booking for today, trying each candidate customer until one is not already at
 * today's reservation cap. Leaves the dialog closed (submitted) on return.
 */
async function createConfirmedBookingToday(bookingsPage: BookingsPage, bookingDialog: BookingDialogPage): Promise<void> {
  const reopenDialog = () => bookingsPage.newBookingButton.click();

  for (const customerName of CANDIDATE_CUSTOMERS) {
    await bookingDialog.selectFirstOpenSessionOnDate(customerName, TODAY_LABEL, reopenDialog);
    await bookingDialog.submitButton.click();

    const rejectionAlert = bookingDialog.dialog.getByRole('alert');
    await Promise.race([
      bookingDialog.successToast.waitFor({ state: 'visible', timeout: 5_000 }),
      rejectionAlert.waitFor({ state: 'visible', timeout: 5_000 }),
    ]).catch(() => undefined);

    if (await bookingDialog.successToast.isVisible()) return;

    // Rejected (most likely "this customer already has N booking(s) on this day") - close and
    // try the next candidate with a fresh dialog mount.
    await bookingDialog.cancelButton.click();
    await expect(bookingDialog.dialog).toBeHidden();
    await reopenDialog();
  }

  throw new Error(`None of ${CANDIDATE_CUSTOMERS.join(', ')} could book today; the demo dataset may have changed shape.`);
}

test.describe('Demo state persistence across reload and tabs (ADR-022)', () => {
  // Desktop admin UI only, same reason as 02-new-booking.spec.ts: these flows drive the sidebar
  // nav and the admin bookings table, which only render at the lg breakpoint.
  test.skip(({ isMobile }) => isMobile, 'desktop admin UI only - the sidebar nav is hidden below the lg breakpoint');

  test('a booking created in admin survives a full navigation to /dashboard, not just a client-side one', async ({
    authenticatedPage,
  }) => {
    const appShell = new AppShellPage(authenticatedPage);
    const dashboardPage = new DashboardPage(authenticatedPage);
    const bookingsPage = new BookingsPage(authenticatedPage);
    const bookingDialog = new BookingDialogPage(authenticatedPage);

    await dashboardPage.goto();
    const beforeCount = await dashboardPage.kpiValue("Today's bookings");

    await appShell.goTo('Bookings');
    await bookingsPage.newBookingButton.click();
    await createConfirmedBookingToday(bookingsPage, bookingDialog);

    // The whole point of this spec: a real browser navigation, not appShell.goTo()'s client-side
    // link click. Pre-ADR-022 this regenerated the in-memory dataset from scratch and the KPI
    // would drop back to beforeCount.
    await authenticatedPage.goto('/dashboard');

    const afterCount = await dashboardPage.kpiValue("Today's bookings");
    expect(afterCount).toBe(beforeCount + 1);
  });

  test('a public booking made at /book survives a full navigation to /bookings and appears in the table', async ({
    authenticatedPage,
  }) => {
    const wizard = new PublicBookingWizardPage(authenticatedPage);
    const bookingsPage = new BookingsPage(authenticatedPage);

    await wizard.goto();
    const className = await wizard.selectFirstAvailableSession();
    const customerName = 'Persistence E2E Customer';
    await wizard.fillContactInfo({ name: customerName, phone: '+1 555 000 7777', email: 'persistence-e2e@example.com' });
    await wizard.confirmReservationButton.click();
    await expect(wizard.successHeading).toBeVisible();

    // This is the demo's climax (master plan section 61, steps 13-17): a real navigation from
    // the public booking route to the admin bookings table, in the same tab.
    await authenticatedPage.goto('/bookings');

    await bookingsPage.searchInput.fill(customerName);
    const newRow = bookingsPage.table.getByRole('row').filter({ hasText: customerName }).filter({ hasText: className });
    await expect(newRow.first()).toBeVisible();
  });

  test('a booking made in one tab appears in a second tab of the same session without a reload', async ({
    browser,
    adminStorageStatePath,
  }) => {
    const context = await browser.newContext({ storageState: adminStorageStatePath });
    const pageA = withHydrationAwareGoto(await context.newPage());
    const pageB = withHydrationAwareGoto(await context.newPage());

    try {
      const dashboardA = new DashboardPage(pageA);
      const dashboardB = new DashboardPage(pageB);
      const appShellA = new AppShellPage(pageA);
      const bookingsA = new BookingsPage(pageA);
      const bookingDialogA = new BookingDialogPage(pageA);

      await dashboardA.goto();
      await dashboardB.goto();
      const beforeCountB = await dashboardB.kpiValue("Today's bookings");

      await appShellA.goTo('Bookings');
      await bookingsA.newBookingButton.click();
      await createConfirmedBookingToday(bookingsA, bookingDialogA);

      // No reload of pageB: the `storage` event listener must pick this up on its own.
      await expect
        .poll(() => dashboardB.kpiValue("Today's bookings"), { timeout: 10_000 })
        .toBe(beforeCountB + 1);
    } finally {
      await context.close();
    }
  });

  test('Reset demo data restores the seeded totals', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    const appShell = new AppShellPage(authenticatedPage);
    const bookingsPage = new BookingsPage(authenticatedPage);
    const bookingDialog = new BookingDialogPage(authenticatedPage);

    await dashboardPage.goto();
    const seededCount = await dashboardPage.kpiValue("Today's bookings");

    await appShell.goTo('Bookings');
    await bookingsPage.newBookingButton.click();
    await createConfirmedBookingToday(bookingsPage, bookingDialog);

    await appShell.goTo('Dashboard');
    expect(await dashboardPage.kpiValue("Today's bookings")).toBe(seededCount + 1);

    // Reset now lives only in Settings (src/components/settings/reset-demo-section.tsx) - the
    // top bar's Demo Mode badge and its reset icon button were removed (account identity and
    // reset both moved off the top bar to avoid duplicating the rail/Settings).
    await appShell.goTo('Settings');
    await authenticatedPage.getByRole('button', { name: /reset demo data/i }).click();
    await authenticatedPage
      .getByRole('dialog', { name: /reset demo data\?/i })
      .getByRole('button', { name: /^reset$/i })
      .click();

    await appShell.goTo('Dashboard');
    await expect
      .poll(() => dashboardPage.kpiValue("Today's bookings"), { timeout: 10_000 })
      .toBe(seededCount);
  });
});
