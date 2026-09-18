// Signs in with the Demo Auth credentials (master plan section 16 / 44) and hands back an
// authenticated, hydration-aware page. Login runs once per worker and the resulting storage
// state is reused by every test that asks for `authenticatedPage` on that worker, per the
// task's "session reused across tests where that is safe" — safe here means read-only specs;
// a spec that needs a clean, un-mutated session should still call `signIn` itself on a fresh
// context instead of reusing this fixture.
import path from 'node:path';
import { test as hydrationTest, expect, withHydrationAwareGoto } from './hydration';
import type { Page } from '@playwright/test';

export const DEMO_ADMIN_EMAIL = 'admin@demo.com';
export const DEMO_ADMIN_PASSWORD = 'demo1234';

const STORAGE_STATE_PATH = path.join(__dirname, '..', '.auth', 'admin.json');

async function signIn(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(DEMO_ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(DEMO_ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

type AuthFixtures = {
  authenticatedPage: Page;
};

type AuthWorkerFixtures = {
  adminStorageStatePath: string;
};

export const test = hydrationTest.extend<AuthFixtures, AuthWorkerFixtures>({
  // Worker-scoped: one real login per worker process, not one per test file.
  // `provide` not `use`: see the matching comment in fixtures/hydration.ts.
  adminStorageStatePath: [
    async ({ browser }, provide) => {
      const context = await browser.newContext();
      const page = withHydrationAwareGoto(await context.newPage());
      await signIn(page);
      await context.storageState({ path: STORAGE_STATE_PATH });
      await context.close();
      await provide(STORAGE_STATE_PATH);
    },
    { scope: 'worker' },
  ],

  authenticatedPage: async ({ browser, adminStorageStatePath }, provide) => {
    const context = await browser.newContext({ storageState: adminStorageStatePath });
    const page = withHydrationAwareGoto(await context.newPage());
    await provide(page);
    await context.close();
  },
});

export { expect, signIn };
