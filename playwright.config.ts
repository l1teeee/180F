// e2e/README.md explains how to run this suite and what the hydration fixture waits for.
// ADR-005 / ADR-014: Playwright owns the seven critical flows (docs/11-TEST-PLAN.md section 4);
// `pnpm test` (Vitest) never starts a browser, so this file and `pnpm test:e2e` are the only
// place a real browser runs.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  // Attaches to the dev server that is already running per the task's harness setup
  // (`reuseExistingServer: true`); the generous 120s timeout covers Next.js's first cold
  // compile of a route on a machine where nothing has been visited yet.
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
