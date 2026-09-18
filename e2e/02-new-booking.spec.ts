// docs/11-TEST-PLAN.md section 4, flow 2. Page objects to use once filled in: e2e/pages/
// bookings.page.ts (BookingsPage), e2e/pages/booking-dialog.page.ts (BookingDialogPage),
// e2e/pages/dashboard.page.ts (DashboardPage). Requires the auth fixture (e2e/fixtures/auth.ts).
import { test } from './fixtures/auth';

test.describe('Dashboard -> New Booking -> Create -> Booking appears', () => {
  test.fixme('creating a booking updates the bookings table and the dashboard KPI', async () => {
    // 1. Read DashboardPage's "Today bookings" KPI value before the mutation.
    // 2. BookingsPage(authenticatedPage).goto(); newBookingButton.click().
    // 3. BookingDialogPage.fillAndSubmit({ customer, className, date, time, instructor })
    //    with a valid, non-full session (ADR-017: capacity is re-validated at commit).
    // 4. expect(bookingDialogPage.successToast).toBeVisible().
    // 5. expect the new booking's row to be present in BookingsPage.table (rowByCustomerName).
    // 6. Navigate to DashboardPage; expect the "Today bookings" KPI to have increased by
    //    exactly 1 versus the value read in step 1 (ADR-006: cross-screen consistency, not a
    //    hard-coded number).
  });
});
