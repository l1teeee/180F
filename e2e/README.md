# Playwright E2E harness

Per `docs/11-TEST-PLAN.md` section 4 and ADR-014. `pnpm test` (Vitest) never opens a browser;
this suite is the only place one runs.

## Running it

```bash
pnpm exec playwright install chromium   # once, or after a Playwright version bump
pnpm test:e2e                           # headless, both projects
pnpm exec playwright test --ui          # interactive UI mode, easiest while writing a spec
pnpm exec playwright test e2e/01-login-to-dashboard.spec.ts   # one file
pnpm exec playwright show-report        # open the last HTML report
```

`playwright.config.ts` points `webServer` at `pnpm dev` with `reuseExistingServer: true`: if a
dev server is already up on `http://localhost:3000` (the usual case during active development),
Playwright attaches to it instead of starting a second one; otherwise it starts one itself.

Two projects run every spec: `chromium-desktop` (1440x900) and `mobile` (390x844). A spec that
is meant for only one viewport should say so with `test.skip(({ isMobile }) => ..., reason)` —
see the note at the top of `05-public-booking.spec.ts` / `06-public-booking-mobile.spec.ts`.

## The hydration fixture — why it exists and how it works

ADR-005: demo data is seeded on the client after mount (`useDemoRuntimeStore.hydrateDemo()`),
never during render, so there is never a server/client HTML mismatch. Until seeding finishes,
`useDemoRuntimeStore.status` is `'loading'` and every data view renders a skeleton
(`docs/08-STATE-MANAGEMENT.md` section 8.4). A test that queries the DOM before that point is
racing the seed, not testing the app — that race is the single biggest source of E2E flakiness
in an app built this way.

`e2e/fixtures/hydration.ts` solves it with a real signal instead of a timeout:

- It waits for `body[data-demo-status="ready"]` to be attached, using Playwright's
  auto-retrying `expect(...).toBeAttached()` (a bounded poll driven by an actual DOM mutation,
  not a fixed sleep).
- Its `page` fixture wraps `page.goto` so every full navigation already includes that wait — a
  spec that imports `test` from this file gets a hydration-safe `page` for free.
- `waitForDemoReady(page)` is exported separately for the case a navigation happens client-side
  (a sidebar link click, a redirect) rather than through `page.goto`.

### Required DOM signal — not yet implemented, needed for Phase 10

**`e2e/fixtures/hydration.ts` currently has nothing to wait for.** As of this harness, nothing
in `src/` writes a `data-demo-status` attribute anywhere. This is the one concrete requirement
this phase is handing to whoever builds `DemoDataProvider`
(`docs/08-STATE-MANAGEMENT.md` sections 3 and 8.4, a client component under `components/layout/`):

```text
Mirror useDemoRuntimeStore.status onto the DOM as it changes, client-side only:

  <body data-demo-status="idle" | "loading" | "ready" | "error">
```

A plain effect that runs `document.body.dataset.demoStatus = status` whenever the store's
`status` changes is enough. It must never be part of the initial server-rendered markup — ADR-005's whole point is that no data-derived HTML exists on the server — so this is a `useEffect`
inside a client component, not a prop threaded into `RootLayout`.

Until that attribute exists, any spec that actually calls `waitForDemoReady` (directly, or via
the hydration-aware `page` fixture, or via the auth fixture which is built on top of it) will
time out after 15s with an error message naming this exact requirement. `07-admin-nav-smoke.spec.ts`
is the only spec that runs today, and it does not depend on this signal for that reason — see
its own header comment.

## The auth fixture

`e2e/fixtures/auth.ts` signs in with the Demo Auth credentials from master plan section 44
(`admin@demo.com` / `demo1234`), extends the hydration fixture (so `authenticatedPage.goto` is
also hydration-aware), and hands back an `authenticatedPage`. Login runs once per Playwright
worker (`adminStorageStatePath` is a worker-scoped fixture) and the resulting storage state is
reused by every test that asks for `authenticatedPage` on that worker — cheap, since none of the
seven flows depend on a *clean* session (data resets on reload per ADR-005/§24 regardless).

```ts
import { test, expect } from './fixtures/auth';

test('example', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard'); // already signed in, already hydrated
});
```

## Page objects (`e2e/pages/`)

One file per surface, locators built on ARIA roles and accessible names (never CSS classes) so
they survive restyling per the task brief. Each file's header comment cites the master-plan
section its copy/labels come from — when a component's real accessible name differs once built,
update the locator there, not in the specs that use it.

| File | Covers |
|---|---|
| `login.page.ts` | `/login` form |
| `app-shell.page.ts` | Sidebar nav, top bar; also exports `ADMIN_ROUTES`, the route list the smoke test walks |
| `dashboard.page.ts` | `/dashboard` KPI cards and chart sections |
| `bookings.page.ts` | `/bookings` table, filters, tabs |
| `booking-dialog.page.ts` | The "New booking" dialog |
| `calendar.page.ts` | `/calendar` (FullCalendar) |
| `session-sheet.page.ts` | The session-details sheet opened from the calendar |
| `customers.page.ts` | `/customers` table |
| `customer-detail.page.ts` | `/customers/[id]` |
| `public-booking-wizard.page.ts` | `/book`, the public booking wizard |

## Specs

`07-admin-nav-smoke.spec.ts` is the one spec that runs today. It probes for `/login`; if it's a
404 or has no email field, or sign-in doesn't reach `/dashboard`, the test calls `test.skip()`
with the specific reason and stops — it never fails the suite over unfinished UI. Once login and
the sidebar exist, the same test walks every route in `ADMIN_ROUTES` and fails if any response is
404/500 or any route logs a console error.

`01` through `06` are placeholders: a `describe` block per flow from `docs/11-TEST-PLAN.md`
section 4, and a `test.fixme(...)` per assertion with the exact steps written as comments.
`test.fixme` is reported as "fixme" (not run, not counted as a failure) until Phase 10 removes
the `.fixme` and fills in the body using the page objects named in each file's header comment.

| Spec | Flow |
|---|---|
| `01-login-to-dashboard.spec.ts` | Demo login -> Dashboard |
| `02-new-booking.spec.ts` | Dashboard -> New Booking -> Create -> Booking appears everywhere it should (ADR-006) |
| `03-calendar-capacity.spec.ts` | Calendar session sheet capacity matches the class detail page |
| `04-customer-detail.spec.ts` | Customers -> Customer detail, no console error |
| `05-public-booking.spec.ts` | Public booking wizard, desktop |
| `06-public-booking-mobile.spec.ts` | Public booking wizard, mobile (390x844), layout-only assertions |
| `07-admin-nav-smoke.spec.ts` | Navigation smoke test (runs today) |

## What Phase 10 still has to do

1. Ask the UI agents for the `data-demo-status` attribute above (or confirm it already landed).
2. Fill in `01`-`06`: remove `.fixme`, use the page objects, replace the comment steps with real
   `expect(...)` calls.
3. Adjust any locator in `e2e/pages/*.ts` whose real accessible name ends up differing from the
   master-plan copy it was built from — the header comment on each file says which section to
   re-check.
4. Add the desktop/mobile `test.skip(({ isMobile }) => ...)` guards noted in `05` and `06` so
   they don't duplicate each other across the two projects.
5. Record the `pnpm test:e2e` pass/fail summary in `docs/14-PROGRESS.md` per
   `docs/11-TEST-PLAN.md` section 7 — a red run is never marked done there.
