// The hydration-aware page fixture.
//
// ADR-005 / ADR-014: `useDemoRuntimeStore.status` starts 'idle', goes 'loading' while
// `hydrateDemo()` seeds every store on the client, then 'ready' (or 'error'). Every data view
// renders skeletons until 'ready' (docs/08-STATE-MANAGEMENT.md section 8.4). A test that
// asserts against the DOM before that point is racing the seed and will flake.
//
// REQUIREMENT FOR THE UI AGENTS (not yet implemented anywhere in src/ as of this writing):
// Mirror `useDemoRuntimeStore.status` onto the DOM so a browser-level tool (this harness, or
// anyone debugging by hand) can wait on it without reaching into React state:
//
//   <body data-demo-status="idle|loading|ready|error">
//
// The natural place is the `DemoDataProvider` client component described in
// docs/08-STATE-MANAGEMENT.md section 3/8.4 (`components/layout/`), e.g. a small effect that
// runs `document.body.dataset.demoStatus = status` whenever the store's `status` changes. It
// must never be set during SSR (ADR-005's whole point is no data-derived HTML on the server),
// so this is a client-only effect, not a prop threaded into the initial markup.
//
// Until that attribute exists, `waitForDemoReady` below will time out with a message naming
// exactly this requirement — that is deliberate: a spec that needs real data must fail loudly
// on a missing signal, never silently race a skeleton.
import { test as base, expect, type Page } from '@playwright/test';

export const DEMO_STATUS_ATTRIBUTE = 'data-demo-status';
export const DEMO_STATUS_READY = 'ready';
const READY_SELECTOR = `body[${DEMO_STATUS_ATTRIBUTE}="${DEMO_STATUS_READY}"]`;

const MISSING_SIGNAL_HINT =
  `Waiting for body[${DEMO_STATUS_ATTRIBUTE}="${DEMO_STATUS_READY}"]. ` +
  'If this is timing out because the attribute does not exist yet, see the requirement ' +
  'documented at the top of e2e/fixtures/hydration.ts and e2e/README.md: the UI must mirror ' +
  "useDemoRuntimeStore.status onto <body data-demo-status>.";

/**
 * Waits for the real "demo data seeded" signal instead of an arbitrary timeout. Safe to call
 * after any client-side navigation (a sidebar link click, a redirect) as well as after `goto`.
 */
export async function waitForDemoReady(page: Page, timeout = 15_000): Promise<void> {
  await expect(page.locator(READY_SELECTOR), MISSING_SIGNAL_HINT).toBeAttached({ timeout });
}

/**
 * Wraps a page's `goto` so every full navigation lands on a page whose demo data has already
 * finished seeding. Component/route tests that only need one navigation should prefer the
 * `page` fixture below over calling this directly; it exists so the auth fixture (which opens
 * its own browser contexts) can apply the same behavior.
 */
export function withHydrationAwareGoto(page: Page): Page {
  const originalGoto = page.goto.bind(page);
  page.goto = (async (url: string, options?: Parameters<Page['goto']>[1]) => {
    const response = await originalGoto(url, options);
    await waitForDemoReady(page);
    return response;
  }) as Page['goto'];
  return page;
}

export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await use(withHydrationAwareGoto(page));
  },
});

export { expect };
