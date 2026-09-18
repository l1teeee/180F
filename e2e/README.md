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
is meant for only one viewport says so with `test.skip(({ isMobile }) => ..., reason)` — see the
note at the top of `05-public-booking.spec.ts` / `06-public-booking-mobile.spec.ts` (the public
booking flow itself) and `02-new-booking.spec.ts` / `04-customer-detail.spec.ts` (desktop-only:
the admin sidebar and `DataTable`'s `<table>` are both hidden below their own breakpoints, per
each file's own header comment).

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

### The DOM signal

`src/components/layout/demo-data-provider.tsx` mirrors `useDemoRuntimeStore.status` onto
`<body data-demo-status="idle" | "loading" | "ready" | "error">` from a client-only effect (never
part of the initial server-rendered markup, per ADR-005), so `waitForDemoReady` above has a real
signal to wait on. If that attribute is ever removed, any spec that calls `waitForDemoReady`
(directly, via the hydration-aware `page` fixture, or via the auth fixture built on top of it)
will time out after 15s with an error message naming this exact requirement.

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
| `stat-card.ts` | Shared reader for `StatCard` (dashboard/customers/customer-detail KPI cards) — the component has no ARIA role of its own, see its own header comment for how this locates and reads one anyway |

Several real components differ from the master-plan copy or roles the page objects were first
sketched against (verified against live a11y snapshots, not assumed): `StatCard` renders no
`role="group"`, `SectionCard` titles are plain text with no `role="region"`, FullCalendar's
events carry no ARIA role at all, and the admin `BookingDialogPage`'s "Instructor" field is a
derived, read-only fact rather than a `<select>`. Each affected locator's own comment explains
the real markup and the workaround; new locators should keep doing the same (a live snapshot,
not a guess) before trusting an assumed role or name.

## Specs

All seven specs are real and pass on `pnpm test:e2e` (13 tests run, 5 intentionally skipped —
see the viewport note above; `pnpm exec playwright show-report` after a run for the full detail).

| Spec | Flow |
|---|---|
| `01-login-to-dashboard.spec.ts` | Demo login -> Dashboard; wrong credentials stay on `/login` with a visible error |
| `02-new-booking.spec.ts` | Dashboard -> New Booking -> Create -> Booking appears everywhere it should (ADR-006). Desktop only |
| `03-calendar-capacity.spec.ts` | Calendar (week/month/day) -> open a session -> its sheet's capacity matches the same event's own calendar figure |
| `04-customer-detail.spec.ts` | Customers -> Customer detail, no console error. Desktop only |
| `05-public-booking.spec.ts` | Public booking wizard, desktop |
| `06-public-booking-mobile.spec.ts` | Public booking wizard, mobile (390x844): a full session is disabled, and a rapid double-submit still lands on exactly one confirmation screen |
| `07-admin-nav-smoke.spec.ts` | Every sidebar route loads with no console error and no 404/500 |

`02-new-booking.spec.ts` navigates via real sidebar link clicks (`AppShellPage.goTo`), never
`page.goto()`, once it has mutated state: the demo dataset lives only in memory
(ADR-005 "data resets on reload"), and `page.goto()` is a real browser navigation that would
silently regenerate a fresh dataset and erase the very booking the test just created.

`05-public-booking.spec.ts` does not additionally check that the booking is reflected in the
admin bookings table (docs/11-TEST-PLAN.md's own version of flow 5 asks for that; the task brief
that built these specs did not). That check turns out not to be testable without touching
application code: `/book` has no in-app link into the admin section, and reaching `/login` any
other way is a `page.goto()` — see the same in-memory-only reset above. See that spec's own
header comment.

## Known gaps for a follow-up

- **No persistence across a full navigation.** By design (ADR-005), the demo dataset exists only
  in the page's JS memory; any `page.goto()` regenerates a fresh (but deterministically
  identical) one. This is why `02` uses link clicks instead of `goto()`, and why `05` cannot
  verify a public booking against the admin bookings table. If a future flow needs that
  guarantee, it needs either an in-app link between `/book` and the admin section, or some form
  of cross-reload persistence — both are structural/architecture changes, not an e2e-only fix.
- **`06`'s "submitting twice creates exactly one booking" check is a black-box proxy.** Nothing
  in `src/` exposes the booking store to the browser's `window`, so this suite cannot assert an
  exact row count directly; it instead dispatches two native clicks in one synchronous call and
  checks that exactly one confirmation screen results. The actual dedup guarantee (`serialize()`
  + `selectBookingEligibility`'s "already booked" check in `src/stores/booking.store.ts`) is a
  store-level concern better proven by a Vitest test against the store directly, per
  `docs/11-TEST-PLAN.md` section 3's booking-store row — if that unit test does not already cover
  a double `createPublicBooking` call for the same session/email, it is worth adding there.
