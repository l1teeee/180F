// docs/11-TEST-PLAN.md section 4, flow 2 (ADR-006: cross-screen consistency - a booking made
// in one place must move the same number everywhere it is shown).
import { format } from 'date-fns';
import { test, expect } from './fixtures/auth';
import { AppShellPage } from './pages/app-shell.page';
import { BookingsPage } from './pages/bookings.page';
import { BookingDialogPage } from './pages/booking-dialog.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Dashboard -> New Booking -> Create -> Booking appears', () => {
  // Desktop admin UI only: the sidebar (with the "Bookings"/"Dashboard" nav links this flow
  // clicks through) only renders at the lg breakpoint (src/components/layout/app-sidebar.tsx
  // "hidden ... lg:flex"); below that, navigation lives in a separate mobile drawer this flow
  // does not open. The 390x844 mobile project is otherwise reserved for the public booking
  // flow (05/06) per the task brief.
  test.skip(({ isMobile }) => isMobile, 'desktop admin UI only - the sidebar nav is hidden below the lg breakpoint');

  test('creating a booking for today updates the bookings table and moves the dashboard KPI by exactly one', async ({
    authenticatedPage,
  }) => {
    const appShell = new AppShellPage(authenticatedPage);
    const dashboardPage = new DashboardPage(authenticatedPage);
    const bookingsPage = new BookingsPage(authenticatedPage);
    const bookingDialog = new BookingDialogPage(authenticatedPage);

    await dashboardPage.goto();
    const beforeCount = await dashboardPage.kpiValue("Today's bookings");

    // Client-side nav (sidebar link), not page.goto(): the demo dataset lives only in memory
    // (ADR-005 "data resets on reload"), and page.goto() is a real browser navigation that
    // would silently regenerate a fresh dataset and erase the booking this test is about to
    // create - defeating the cross-screen comparison below.
    await appShell.goTo('Bookings');
    await bookingsPage.newBookingButton.click();

    const customerName = 'Customer 01';
    const todayLabel = format(new Date(), 'MMM d, yyyy'); // matches DISPLAY_DATE_FORMAT
    const className = await bookingDialog.selectFirstSessionOnDate(customerName, todayLabel);

    await expect(bookingDialog.capacityText).toBeVisible();
    await bookingDialog.submitButton.click();
    await expect(bookingDialog.successToast).toBeVisible();

    await bookingsPage.searchInput.fill(customerName);
    const newRow = bookingsPage.table.getByRole('row').filter({ hasText: customerName }).filter({ hasText: className });
    await expect(newRow.first()).toBeVisible();

    await appShell.goTo('Dashboard'); // client-side nav again, same reason as above
    const afterCount = await dashboardPage.kpiValue("Today's bookings");
    expect(afterCount).toBe(beforeCount + 1);
  });
});
