// docs/11-TEST-PLAN.md section 4, flow 7: visits every sidebar route, asserts no 404/500 and
// no console error. This is the one spec meant to pass (or skip cleanly) today — see the task
// brief: /login and /dashboard do not exist yet, so this test probes for them first and skips
// with a stated reason rather than failing the suite over unfinished UI.
//
// Deliberately imports the base `test`/`expect` from @playwright/test, not the hydration-aware
// fixture (e2e/fixtures/hydration.ts) or the auth fixture (e2e/fixtures/auth.ts): those wait on
// signals (`data-demo-status="ready"`, a successful redirect to /dashboard) that do not exist
// yet either, and this spec's whole job is to behave correctly when they don't.
import { test, expect } from '@playwright/test';
import { ADMIN_ROUTES } from './pages/app-shell.page';
import { LoginPage } from './pages/login.page';
import { seedEnglishLocale, waitForDemoReady } from './fixtures/hydration';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from './fixtures/auth';

test.describe('admin navigation smoke test', () => {
  test('every sidebar route loads without a console error or a 404/500 response', async ({ page }) => {
    // i18n phase 1: this spec bypasses fixtures/hydration.ts's own `page` fixture (see the file
    // header comment), so English has to be seeded here too - see E2E_LOCALE_STORAGE_KEY's
    // comment in fixtures/hydration.ts for why this suite pins English on purpose.
    await seedEnglishLocale(page);
    const loginResponse = await page.goto('/login').catch(() => null);
    if (!loginResponse || loginResponse.status() === 404) {
      test.skip(true, 'Skipping: /login does not exist yet. See CLAUDE.md Routes and master plan section 16.');
      return;
    }

    const loginPage = new LoginPage(page);
    const hasLoginForm = await loginPage.emailInput.isVisible().catch(() => false);
    if (!hasLoginForm) {
      test.skip(true, 'Skipping: /login exists but has no accessible email field yet (UI incomplete).');
      return;
    }

    await loginPage.signIn(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD);
    const signedIn = await page
      .waitForURL(/\/dashboard$/, { timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!signedIn) {
      test.skip(true, 'Skipping: signing in with the demo credentials did not redirect to /dashboard yet.');
      return;
    }

    const findings: string[] = [];
    let consoleErrorsForCurrentRoute: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrorsForCurrentRoute.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrorsForCurrentRoute.push(error.message));

    for (const route of ADMIN_ROUTES) {
      consoleErrorsForCurrentRoute = [];
      const response = await page.goto(route.path);
      const status = response?.status() ?? 0;
      if (status === 404 || status >= 500) {
        findings.push(`${route.path}: HTTP ${status}`);
        continue;
      }
      // Best-effort: assert real errors once the app has actually finished seeding, not while
      // the skeleton is still up. Non-fatal if the signal isn't there yet (see hydration.ts) —
      // this loop's job is console/404 detection, not enforcing the hydration contract.
      await waitForDemoReady(page, 5_000).catch(() => undefined);
      if (consoleErrorsForCurrentRoute.length > 0) {
        findings.push(`${route.path}: console error(s): ${consoleErrorsForCurrentRoute.join(' | ')}`);
      }
    }

    expect(findings, findings.join('\n')).toEqual([]);
  });
});
