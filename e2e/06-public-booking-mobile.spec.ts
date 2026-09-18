// docs/11-TEST-PLAN.md section 4, flow 6. Same wizard as flow 5 (e2e/05-public-booking.spec.ts)
// at the "mobile" project's 390x844 viewport (playwright.config.ts) - guarded below so this
// file exercises only the mobile project and 05 only chromium-desktop, per the task brief.
import { test, expect } from './fixtures/hydration';
import { PublicBookingWizardPage } from './pages/public-booking-wizard.page';

test.describe('Public booking on mobile viewport', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only, see 05-public-booking.spec.ts for desktop');

  test('a full session is disabled and cannot be selected', async ({ page }) => {
    const wizard = new PublicBookingWizardPage(page);
    await wizard.goto();

    const disabledSlot = await wizard.findDisabledSlotToday();
    await expect(disabledSlot).toBeDisabled();
    await expect(disabledSlot).toHaveText(/full/i);
  });

  test('completing the wizard shows the success screen, and submitting twice creates exactly one booking', async ({
    page,
  }) => {
    const wizard = new PublicBookingWizardPage(page);
    await wizard.goto();

    await wizard.selectFirstAvailableSession();
    await wizard.fillContactInfo({
      name: 'Mobile E2E Customer',
      phone: '+1 555 000 5678',
      email: 'mobile-e2e@example.com',
    });

    // Dispatch two native clicks on the button in one synchronous browser-side call, bypassing
    // Playwright's own actionability retry loop entirely (a plain second `.click()` would just
    // wait - and eventually time out - for the button to become enabled/attached again once the
    // first click's submission starts disabling and then unmounting it). This is what actually
    // exercises the demo's re-entrancy guard (docs/08-STATE-MANAGEMENT.md section 8.2:
    // createPublicBooking sets `mutation: 'pending'` before its first await and is wrapped in
    // serialize()) instead of relying on Playwright's own click delay to hide the race. A
    // second, actually-processed submission for the same session and email would resolve
    // against the store's "already booked" check (selectBookingEligibility) rather than create
    // a duplicate row - see e2e/README.md for why this suite cannot inspect the store directly
    // to assert an exact count, and what is asserted here instead.
    await wizard.confirmReservationButton.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });

    await expect(wizard.successHeading).toBeVisible();
    // Only one confirmation screen exists to land on regardless of how many submissions were
    // attempted - the form (and the button that could submit a second time) is unmounted the
    // moment the first one succeeds.
    await expect(page.getByRole('heading', { name: /your class is booked/i })).toHaveCount(1);
  });
});
