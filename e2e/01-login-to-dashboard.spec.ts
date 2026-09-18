// docs/11-TEST-PLAN.md section 4, flow 1.
import { test, expect } from './fixtures/hydration';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from './fixtures/auth';
import { LoginPage } from './pages/login.page';
import { DashboardPage, DASHBOARD_KPI_LABELS } from './pages/dashboard.page';

test.describe('Demo login -> Dashboard', () => {
  test('signing in with demo credentials redirects to /dashboard and every KPI renders a real number', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD);

    await expect(page).toHaveURL(/\/dashboard$/);

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();

    // statCardValue throws if the card's text is not a real number (e.g. a leftover "--" or
    // "Loading" placeholder), so a passing read here already proves it is not a skeleton.
    for (const label of DASHBOARD_KPI_LABELS) {
      const value = await dashboardPage.kpiValue(label);
      expect(value, `${label} should be a non-negative number`).toBeGreaterThanOrEqual(0);
    }
  });

  test('wrong credentials stay on /login with a visible error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn('wrong@demo.com', 'wrong-password');

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});
