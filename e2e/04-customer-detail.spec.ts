// docs/11-TEST-PLAN.md section 4, flow 4.
import { test, expect } from './fixtures/auth';
import { CustomersPage } from './pages/customers.page';

test.describe('Customers -> Customer detail', () => {
  // Desktop admin UI only: DataTable (src/components/shared/data-table.tsx) renders the real
  // <table> only in a "hidden md:block" wrapper, swapping to per-row cards below the md
  // breakpoint - this flow's row-click interaction has no equivalent on the 390x844 mobile
  // project, which is otherwise reserved for the public booking flow (05/06) per the task brief.
  test.skip(({ isMobile }) => isMobile, 'desktop admin UI only - the table is hidden below the md breakpoint');

  test('opening a customer row renders their profile, stats and activity without a console error', async ({
    authenticatedPage,
  }) => {
    const consoleErrors: string[] = [];
    authenticatedPage.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    authenticatedPage.on('pageerror', (error) => consoleErrors.push(error.message));

    const customersPage = new CustomersPage(authenticatedPage);
    await customersPage.goto();

    const customerName = 'Customer 01'; // deterministic seed name, always present (docs/05)
    const customerDetailPage = await customersPage.openCustomer(customerName);

    await expect(authenticatedPage).toHaveURL(/\/customers\/.+/);
    await expect(customerDetailPage.nameHeading).toHaveText(customerName);
    await expect(customerDetailPage.membershipText).toBeVisible();

    const attendanceRate = await customerDetailPage.attendanceRateValue();
    expect(attendanceRate).toBeGreaterThanOrEqual(0);
    expect(attendanceRate).toBeLessThanOrEqual(100);

    await expect(customerDetailPage.activityTimeline.getByRole('listitem').first()).toBeVisible();

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
