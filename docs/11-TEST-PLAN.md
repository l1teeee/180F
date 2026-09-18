# 11 — Test Plan

Test strategy for the demo, per master plan §54 and ADR-014. Owner of this file during Phase 10: Sonnet, updated as tests land; Opus reviews at phase acceptance (§10 Phase 10).

---

## 1. Philosophy

No coverage target. §54 is explicit: do not chase 100 %.

Test the behavior the demo's credibility depends on, not every line. A client-facing demo dies on two failure modes: a number that disagrees with another number on screen, and a flow that breaks live in front of the client. Everything below is chosen to catch one of those two.

Selectors first. Per ADR-006 and ADR-008, `src/domain/selectors/**` holds every piece of arithmetic in the app — occupancy, KPIs, stats, trends, search ranking. Selectors are pure functions of their arguments (§8.4 of `docs/02-ARCHITECTURE.md`), so they are the cheapest place to prove correctness and the place where a bug has the widest blast radius (one wrong selector shows up on the dashboard, the calendar, and a class detail page at once, per ADR-006's whole point). Components are tested only where they carry logic beyond passing selector output to markup (status-to-label mapping, pagination math, form validation wiring).

---

## 2. Tooling and layout

Per ADR-014:

| Tool | Role |
|---|---|
| Vitest | Test runner, unit + component |
| jsdom | DOM environment for Vitest |
| React Testing Library | Component rendering and queries |
| `@testing-library/jest-dom` | DOM matchers, registered in the setup file |
| `@testing-library/user-event` | Simulated user interaction in component tests |
| Playwright | The seven critical flows (§54), real browser |

Versions are exactly those pinned in ADR-002: `vitest ^5.0.1`, `vite ^8.3.0`, `@vitejs/plugin-react ^6.1.1`, `jsdom ^30`, `vite-tsconfig-paths ^6.1.1`, `@testing-library/react ^16.3.3`, `@testing-library/dom ^10.4.2`, `@testing-library/jest-dom ^7`, `@testing-library/user-event ^14.6.7`, `@playwright/test ^1.63.0`. No other test-related package is introduced without an ADR.

### Layout

```text
src/
  domain/selectors/*.test.ts        colocated with the selector file
  domain/schemas/*.test.ts          colocated with the schema file
  data/*.test.ts                    colocated (dataset invariants)
  stores/*.test.ts                  colocated
  components/**/*.test.tsx          colocated with the component
  test/
    setup.ts                        jest-dom registration, jsdom polyfills
    factories.ts                    deterministic test data builders (section 5)

e2e/
  *.spec.ts                         Playwright specs, one file per flow
```

Unit and component tests are `*.test.ts` / `*.test.tsx` next to the source they cover, per ADR-014 and `docs/12-AGENT-OWNERSHIP.md` (each phase's Sonnet write-set includes its own `*.test.ts`). Playwright specs live only in `/e2e`, never colocated.

### Commands

```bash
pnpm test          # vitest run — unit + component, no browser, single pass
pnpm test:watch    # vitest — watch mode for local iteration
pnpm test:e2e      # playwright test — starts its own web server
pnpm check          # typecheck + lint + test (docs/10-IMPLEMENTATION-PLAN.md)
```

`pnpm test` never starts a browser (ADR-014); `pnpm test:e2e` owns the Playwright web server and is not part of `pnpm check`.

### `vitest.config.ts` shape

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,          // explicit imports from 'vitest', no ambient describe/it
  },
});
```

`tsconfigPaths()` resolves the `@/*` import alias (ADR-001's `create-next-app` flags) inside tests without duplicating path mapping. `src/test/setup.ts` registers `@testing-library/jest-dom` matchers and any jsdom polyfill FullCalendar's dynamic-imported code needs when a component test happens to touch it (none of the unit list in section 3 does).

---

## 3. Unit and component test list

One row per test file; each row's "asserts" is the minimum set of cases, not an exhaustive list. File paths are colocated per section 2.

### Dataset and invariants

| File | Asserts |
|---|---|
| `src/data/seed.test.ts` | `buildDemoDataset(demoToday)` invariants from `docs/04-DOMAIN-MODEL.md` §7: every `Booking.customerId`/`sessionId` resolves; `booked <= capacity` for every session; at most one non-cancelled booking per customer per session; `checkedInAt` non-null only for past `confirmed` bookings; waitlist bookings exist only where `available <= 0`; calling `buildDemoDataset` twice with the same `demoToday` produces byte-identical output (seeded PRNG, ADR-005) |

### Selectors — occupancy and sessions (`src/domain/selectors/sessions.ts`)

| File | Asserts |
|---|---|
| `src/domain/selectors/sessions.test.ts` | `selectSessionOccupancy`: `booked = count(confirmed) + count(pending)` (ADR-008, `cancelled` and `waitlist` excluded); `available = max(0, capacity - booked)`; `occupancyState` is `full` when `available <= 0`; `almost_full` when `occupancyRate >= 0.85` and not full; `available` otherwise; the 0.85 boundary itself (exactly 0.85 is `almost_full`, one booking below it is `available`); a session at `booked === capacity` is `full` regardless of `occupancyRate` rounding |

### Selectors — dashboard

| File | Asserts |
|---|---|
| `src/domain/selectors/dashboard.test.ts` | `selectDashboardKpis`: `activeMembers` counts only `status === 'active'` customers; `activeMembersDelta` counts customers whose `joinedAt` falls in the current demo month; `todayBookings` counts bookings for sessions on `demoToday` only; `occupancyRate` is the aggregate of today's sessions (booked/capacity across all of them, not an average of rates); `todayAlmostFull` counts sessions in `almost_full` state today |

### Selectors — weekly trend

| File | Asserts |
|---|---|
| `src/domain/selectors/dashboard.test.ts` (or colocated `bookings.test.ts`, matching whichever file exports `selectWeeklyBookingTrend` per `docs/08-STATE-MANAGEMENT.md` §4) | `selectWeeklyBookingTrend`: returns exactly 7 points ending on `demoToday`; each point's `bookings` count excludes `cancelled` bookings; `label` matches the point's weekday short name; points are in chronological order |

### Selectors — customers

| File | Asserts |
|---|---|
| `src/domain/selectors/customers.test.ts` | `selectCustomerStats`: `attendanceRate` = attended / (attended + no-show), rounded, over the customer's completed-session bookings; a customer with zero completed sessions gets `attendanceRate` of 0, not `NaN`; `remainingCredits` is `null` when `membership.classLimit` is `null` (unlimited plan); `remainingCredits = classLimit - classesThisMonth` (clamped to 0) for a limited plan; `classesThisMonth` counts only the demo-month's non-cancelled bookings |

### Selectors — class occupancy

| File | Asserts |
|---|---|
| `src/domain/selectors/classes.test.ts` | `selectClassOccupancy`: returns one point per class type; `occupancyRate` is the average of `SessionWithOccupancy.occupancyRate` across that class type's sessions in the relevant window; a class type with zero sessions in the window does not throw and returns `occupancyRate: 0` |

### Selectors — bookings and filtering

| File | Asserts |
|---|---|
| `src/domain/selectors/bookings.test.ts` | `filterBookings` with all four filters (`query`, `status`, `source`, `date`) combined: each filter narrows independently and the combination is an AND, not an OR; `status: 'all'` and `source: 'all'` are no-ops; `query` matches customer name case-insensitively; a filter set matching nothing returns `[]`, not `undefined` |

### Selectors — global search

| File | Asserts |
|---|---|
| `src/domain/selectors/search.test.ts` | `selectGlobalSearch`: results are grouped by `kind` (`customer` \| `class` \| `instructor`) per master plan §41's grouped-dropdown example; a query matching entities of more than one kind returns all kinds, each internally ranked by match quality (exact prefix before substring match); an empty query returns `[]`; each result's `href` resolves to that entity's detail route |

### Booking mutations

| File | Asserts |
|---|---|
| `src/stores/booking.store.test.ts` | `createBooking` rejects a booking for a session where `available <= 0` (full session), leaving `bookings` and the session's derived occupancy unchanged; `createBooking` rejects a second active (`confirmed`/`pending`/`waitlist`) booking for the same `customerId` + `sessionId` pair (invariant 3, `docs/04-DOMAIN-MODEL.md` §7); `createBooking` on a valid input appends the booking and triggers `useNotificationStore.push` (the documented cross-store edge, `docs/08-STATE-MANAGEMENT.md` §2); `cancelBooking` flips status to `cancelled` and the session's `available` count increases by one afterward (verified via `selectSessionOccupancy`, not a separate counter — ADR-006) |

### Zod schemas

| File | Asserts |
|---|---|
| `src/domain/schemas/booking-input.test.ts` (admin booking form, `NewBookingInput`) | Valid input parses; missing `customerId` or `sessionId` fails; an invalid `source` value fails |
| `src/domain/schemas/public-booking-input.test.ts` (public booking form, `PublicBookingInput`) | Valid input parses; invalid email format fails (`not-an-email`, `a@b`); missing `phone` fails; empty `name` fails |

### Shared components

| File | Asserts |
|---|---|
| `src/components/shared/status-badge.test.tsx` | `StatusBadge` renders the status label as visible text (not only as a color) for every `BookingStatus`/`CustomerStatus`/`InstructorStatus` value it is given; each status also renders a non-color cue (icon or shape token) alongside the label, per §49's "status conveyed by label + shape, never color alone" |
| `src/components/shared/data-table.test.tsx` | `DataTable` pagination: renders only the current page's row count; page-forward/page-back controls change the visible rows; changing page does not refetch or mutate the source data array |

### Demo authentication

| File | Asserts |
|---|---|
| `src/services/auth/demo-auth-provider.test.ts` | Signing in with `admin@demo.com` / `demo1234` (master plan §44) succeeds and returns a session; any other email/password pair is rejected; an empty password is rejected |

---

## 4. Playwright critical flows

Specs in `/e2e`, one file per flow, named after the flow. Master plan §54 numbering preserved.

| Spec | Flow | Key assertions |
|---|---|---|
| `e2e/01-login-to-dashboard.spec.ts` | Demo login -> Dashboard | Login with demo credentials (§44) redirects to `/dashboard`; the four KPI cards render non-placeholder values; wrong credentials stay on `/login` with a visible error |
| `e2e/02-new-booking.spec.ts` | Dashboard -> New Booking -> Create -> Booking appears | Open the booking dialog, fill a valid booking, submit; the new booking appears in the bookings table and the dashboard's today-bookings KPI increases by 1 (cross-screen consistency, ADR-006) |
| `e2e/03-calendar-capacity.spec.ts` | Calendar -> Open class -> Inspect capacity | Navigate to `/calendar`, open a session, the details sheet shows a `booked / capacity` figure that matches the same session's occupancy shown on `/classes/[id]` |
| `e2e/04-customer-detail.spec.ts` | Customers -> Customer detail | From `/customers`, open a customer row; the detail page renders that customer's name, membership, attendance rate and activity timeline without a console error |
| `e2e/05-public-booking.spec.ts` | Public booking: select class -> select date -> select time -> enter customer -> confirm -> success | Full `/book` wizard at desktop viewport; a full time slot is disabled and not selectable (§37); submitting shows the success screen with class, date, time and studio location (§39); the booking is reflected in the admin bookings table afterward |
| `e2e/06-public-booking-mobile.spec.ts` | Public booking on mobile viewport | Same wizard as flow 5, run at **390x844** (iPhone 12/13-class viewport, matching §14's mobile breakpoint); no horizontal scroll, no overlapping tap targets, the sidebar-free public shell renders (§34) |
| `e2e/07-admin-nav-smoke.spec.ts` | Navigation smoke test for primary admin routes | Visits every sidebar route (`/dashboard`, `/calendar`, `/bookings`, `/customers`, `/classes`, `/instructors`, `/memberships`, `/automations`, `/settings`) in sequence; for each route, asserts zero `page.on('console', ...)` error-level messages and zero 404/500 network responses |

All seven specs start from a fresh browser context and rely on the deterministic seed (section 5) — no spec depends on data created by a previous spec.

---

## 5. Test data policy

Every unit, component and Playwright test that needs demo data seeds it through `buildDemoDataset(demoToday)` (ADR-005, ADR-007) with a **fixed** `demoToday` constant (e.g. `'2026-09-17'`, defined once in `src/test/factories.ts` and reused everywhere), never through `todayISO()` / `new Date()`.

Rules:

- No test asserts against the real current date. A test that needs "today" reads the fixed `demoToday` constant, not the system clock.
- The seeded PRNG (`mulberry32`, ADR-005) makes `buildDemoDataset(fixedDemoToday)` produce byte-identical output on every run and every machine; tests assert against that fixed output rather than ranges or "at least N" checks wherever the exact count is knowable.
- Playwright specs pin the same `demoToday` by running against the app unmodified (the app's own hydration seeds from the real client clock per ADR-005) and assert structural/relative properties (a booking count increased by 1, a slot marked `FULL` is disabled) rather than exact figures that would drift day to day. Where a spec needs an exact figure (e.g. flow 3's capacity match), it reads the figure from one screen and asserts the second screen shows the same figure, not a hard-coded number.
- No test mutates `src/data/**` fixtures in place; store tests call store actions on a store instance seeded fresh per test (`beforeEach` resets the store to a fresh `buildDemoDataset(fixedDemoToday)`).

---

## 6. Deliberately not tested

| Excluded | Why |
|---|---|
| Visual/pixel snapshot tests | The design is still settling through Phase 11 polish; pixel snapshots would churn on every spacing tweak for no correctness value. Visual review happens manually against `docs/03-DESIGN-SYSTEM.md` at each phase gate (`docs/10-IMPLEMENTATION-PLAN.md`) |
| `SupabaseAuthProvider` | Supabase Auth is optional and unconfigured in the demo (ADR-010, master plan §44); there are no real Supabase env vars to test against, and asserting against a real external auth service is out of scope for a frontend-only demo (§2.2) |
| Recharts pixel/SVG output | Chart correctness is proven at the data layer (`selectWeeklyBookingTrend`, `selectClassOccupancy` unit tests, section 3); rendering is Recharts' own tested responsibility. Component tests assert the chart's textual summary (§49) renders, not its SVG geometry |

---

## 7. Definition of done

Phase 10 is done when:

1. Every selector listed in `docs/08-STATE-MANAGEMENT.md` §4's required-selector table has at least one test (ADR-014).
2. Every row in section 3 above exists and passes.
3. All seven Playwright specs in section 4 exist and pass, including the 390x844 mobile run and the seven-route navigation smoke test with zero console errors and zero 404s.
4. `pnpm test` and `pnpm test:e2e` both exit green (`docs/10-IMPLEMENTATION-PLAN.md`, Phase 10 gate).
5. No test depends on the real system clock (section 5).

Results are recorded in `/docs/14-PROGRESS.md` under that file's "Latest verification results" section: the exact `pnpm test` and `pnpm test:e2e` output summary (pass/fail counts), the date, and the commit/phase this run corresponds to. A red run is never marked done in `/docs/14-PROGRESS.md`; Phase 10 does not close until both commands are green (master plan §66.13, §66.14).
