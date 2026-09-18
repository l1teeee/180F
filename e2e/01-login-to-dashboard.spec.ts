// docs/11-TEST-PLAN.md section 4, flow 1. Phase 10 fills this in once /login and /dashboard
// exist; today it is a placeholder naming exactly what will be asserted (task brief step 7).
// Page objects to use once filled in: e2e/pages/login.page.ts (LoginPage), e2e/pages/
// dashboard.page.ts (DashboardPage). Credentials: e2e/fixtures/auth.ts.
import { test } from './fixtures/hydration';

test.describe('Demo login -> Dashboard', () => {
  test.fixme('signing in with demo credentials redirects to /dashboard', async () => {
    // 1. LoginPage(page).goto(); signIn(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD).
    // 2. expect(page).toHaveURL(/\/dashboard$/).
  });

  test.fixme('the four KPI cards render non-placeholder values', async () => {
    // 1. Sign in, land on DashboardPage.
    // 2. For each of "Active members", "Today bookings", "Occupancy", "Today's classes":
    //    expect the KPI card's value text to be non-empty and not a literal placeholder like
    //    "--" or "Loading" (waitForDemoReady already guarantees the data has been seeded).
  });

  test.fixme('wrong credentials stay on /login with a visible error', async () => {
    // 1. LoginPage(page).goto(); signIn('wrong@demo.com', 'wrong-password').
    // 2. expect(page).toHaveURL(/\/login$/).
    // 3. expect(loginPage.errorMessage).toBeVisible().
  });
});
