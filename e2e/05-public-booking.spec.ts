// docs/11-TEST-PLAN.md section 4, flow 5. Page objects to use once filled in: e2e/pages/
// public-booking-wizard.page.ts (PublicBookingWizardPage), e2e/pages/bookings.page.ts
// (BookingsPage, to verify the booking landed in the admin table). Runs at the desktop
// project's default 1440x900 viewport; no admin auth needed (/book has no admin sidebar,
// master plan section 34).
import { test } from './fixtures/hydration';

test.describe('Public booking: select class -> date -> time -> customer -> confirm -> success', () => {
  // Desktop-specific per docs/11 section 4 flow 5; the mobile equivalent is flow 6
  // (e2e/06-public-booking-mobile.spec.ts). Once these tests are real, start each with
  // `test.skip(({ isMobile }) => isMobile, 'desktop-only, see flow 6 for mobile')` so this
  // file exercises only the chromium-desktop project and flow 6 only the mobile project —
  // both projects otherwise run every spec, which would duplicate this flow.
  test.fixme('a full time slot is disabled and cannot be selected', async () => {
    // 1. PublicBookingWizardPage(page).goto(); pick a class whose seeded data includes a FULL
    //    slot (master plan section 37 example: "6:00 PM   FULL").
    // 2. expect(wizard.timeSlot('6:00 PM')).toBeDisabled().
  });

  test.fixme('completing the wizard shows the success screen with class, date, time, location', async () => {
    // 1. Walk classCard -> dateOption -> timeSlot (a non-full slot) -> fillContactInfo(...).
    // 2. confirmReservationButton.click().
    // 3. expect(wizard.successHeading).toBeVisible() ("Your class is booked!").
    // 4. expect the success screen to show the chosen class, date, time and studio location
    //    (master plan section 39; the studio location comes from useSettingsStore.general per
    //    ADR-019, not a hard-coded string in the test).
  });

  test.fixme('the new public booking is reflected in the admin bookings table afterward', async () => {
    // 1. Complete the wizard as above with a known customer name.
    // 2. Sign in as admin (see e2e/fixtures/auth.ts) and open BookingsPage.
    // 3. expect BookingsPage.rowByCustomerName(name) to be visible.
  });
});
