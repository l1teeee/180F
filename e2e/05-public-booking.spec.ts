// docs/11-TEST-PLAN.md section 4, flow 5. Desktop-only (the mobile equivalent is flow 6,
// e2e/06-public-booking-mobile.spec.ts) - guarded below so this file exercises only the
// chromium-desktop project and 06 only the mobile one, per the task brief.
//
// Scoped to the task brief's flow 5 (class -> date -> time -> details -> confirmation) only.
// docs/11's own flow 5 additionally asks to verify the booking "is reflected in the admin
// bookings table afterward" - that is not testable here: /book and the admin routes share one
// in-memory dataset only within a single unreloaded page (RootLayout mounts DemoDataProvider
// once for the whole app), /book has no in-app link into the admin section, and Playwright's
// page.goto() to /login is a real browser navigation that would reload the app and regenerate
// a fresh dataset (ADR-005 "data resets on reload"), erasing the very booking being checked.
// See the final report for this finding.
import { test, expect } from './fixtures/hydration';
import { PublicBookingWizardPage } from './pages/public-booking-wizard.page';

test.describe('Public booking: select class -> date -> time -> details -> confirmation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop-only, see 06-public-booking-mobile.spec.ts');

  test('completing the wizard shows the success screen with class, date, time and location', async ({ page }) => {
    const wizard = new PublicBookingWizardPage(page);
    await wizard.goto();

    await wizard.selectFirstAvailableSession();
    await wizard.fillContactInfo({
      name: 'Desktop E2E Customer',
      phone: '+1 555 000 1234',
      email: 'desktop-e2e@example.com',
    });
    await wizard.confirmReservationButton.click();

    await expect(wizard.successHeading).toBeVisible();
    await expect(page.getByText('Class', { exact: true })).toBeVisible();
    await expect(page.getByText('Date', { exact: true })).toBeVisible();
    await expect(page.getByText('Time', { exact: true })).toBeVisible();
    await expect(page.getByText('Location', { exact: true })).toBeVisible();
  });
});
