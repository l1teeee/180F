// docs/11-TEST-PLAN.md section 4, flow 4. Page objects to use once filled in: e2e/pages/
// customers.page.ts (CustomersPage), e2e/pages/customer-detail.page.ts (CustomerDetailPage).
// Requires the auth fixture (e2e/fixtures/auth.ts).
import { test } from './fixtures/auth';

test.describe('Customers -> Customer detail', () => {
  test.fixme('opening a customer row renders their detail without a console error', async () => {
    // 1. Attach a page.on('console') / page.on('pageerror') listener before navigating.
    // 2. CustomersPage(authenticatedPage).goto(); openCustomer(name).
    // 3. expect(customerDetailPage.nameHeading).toContainText(name).
    // 4. expect(customerDetailPage.membershipText).toBeVisible().
    // 5. expect(customerDetailPage.attendanceRateStat).toBeVisible().
    // 6. expect(customerDetailPage.activityTimeline).toBeVisible().
    // 7. expect no 'error'-type console messages and no pageerror were recorded.
  });
});
