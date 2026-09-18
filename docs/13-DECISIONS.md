# 13 — Decision Log (ADR)

Format: Decision / Context / Alternatives considered / Chosen solution / Reason / Consequences.
Settled decisions are not reopened without new evidence. Owner of this file: Opus.

---

## ADR-001 — Greenfield scaffold, manual project bootstrap

### Context
The repository contained only `GYM_DEMO_MASTER_PLAN.md`, with no git history, no `package.json`, no lockfile and no source. `create-next-app` refuses to scaffold into a directory containing unknown files (the master plan file, and later `CLAUDE.md` / `README.md`), so the standard one-command bootstrap is not usable in place.

### Alternatives considered
1. Scaffold into a temp directory and move files up, deleting the template's `README.md` / `CLAUDE.md` / `AGENTS.md`.
2. Write the project files manually using verified `create-next-app@16.3.5` output as the reference.
3. Scaffold in a subdirectory and keep the app nested.

### Chosen solution
Option 2. The exact output of `create-next-app@16.3.5 --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm` was generated and inspected in a scratch directory; its `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` and `pnpm-workspace.yaml` are reproduced as the baseline and then extended.

### Reason
Deterministic, no move/merge step, no risk of the template overwriting `CLAUDE.md` or `README.md`, and every config file is customised anyway.

### Consequences
`next-env.d.ts` is generated on the first `next dev` / `next build`. The app lives at the repository root; nothing is nested.

---

## ADR-002 — Pinned stack versions

### Context
Latest published versions were checked at planning time (2026-09-17). Several are very new majors: TypeScript 7.0.2 (native port), ESLint 10, Vitest 5, Vite 8, Lucide 1.x, Zod 4, FullCalendar 7.

### Alternatives considered
1. Always-latest for everything.
2. Match the versions Next.js 16 itself ships in its template, and take latest only where verified safe.

### Chosen solution
Option 2:

- `next 16.3.5`, `react 19.2.8`, `react-dom 19.2.8` — exact, as pinned by the Next template.
- `typescript ^5.9.3` — **not** TypeScript 7. The Next 16 template pins `typescript: ^5`; the TS 7 native port is too new for `eslint-config-next@16.3.5` and the `next` TS plugin.
- `eslint ^9` + `eslint-config-next 16.3.5` — **not** ESLint 10; the config is authored against ESLint 9 flat config.
- `tailwindcss ^4.3.3` + `@tailwindcss/postcss ^4.3.3` (CSS-first `@theme`).
- `vitest ^5.0.1` + `vite ^8.3.0` + `@vitejs/plugin-react ^6.1.1`. Peer chain verified: vitest 5 accepts vite `^6.4 || ^7 || ^8`; plugin-react 6 requires vite `^8`.
- `@types/node ^24` — vitest 5 requires `^22 || >=24`; the Next template's `^20` is too low.
- `zod ^4.6.5` + `@hookform/resolvers ^5.9.1` (accepts zod `^3.25 || ^4`) + `react-hook-form ^7.88.0`.
- `recharts ^3.10.1`, `zustand ^5.0.15`, `date-fns ^4.4.0`, `lucide-react ^1.47.0`, `sonner ^2.0.8`.
- `@playwright/test ^1.63.0`, `@testing-library/react ^16.3.3`, `@testing-library/dom ^10.4.2`, `@testing-library/jest-dom ^7`, `@testing-library/user-event ^14.6.7`, `jsdom ^30`, `vite-tsconfig-paths ^6.1.1`.

### Reason
Every peer range above was verified against React 19 before pinning. Using the versions Next itself ships removes the largest class of demo-killing toolchain risk.

### Consequences
If `pnpm install` reports an unsatisfiable peer, the implementer stops and reports to Opus rather than silently changing a version (master plan §0.2).

---

## ADR-003 — FullCalendar 6.1.21, not 7.x

### Context
`@fullcalendar/react` and `@fullcalendar/core` publish `7.1.0`, but the view plugins the demo needs (`daygrid`, `timegrid`, `interaction`) are only at `6.1.21` stable — v7 exists for them solely as `beta` / `rc`. FullCalendar 7 also adds a `temporal-polyfill` peer.

### Alternatives considered
1. FullCalendar 7 core/react plus beta plugins.
2. FullCalendar 6.1.21 across all packages.
3. A hand-built calendar grid.

### Chosen solution
Option 2: `@fullcalendar/react`, `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` all at `6.1.21`. Peer range is `react ^16.7 || ^17 || ^18 || ^19`, so React 19 is supported.

### Reason
Week / Month / Day views are a hard requirement (§22); shipping a client demo on beta view plugins is not acceptable.

### Consequences
The v7 Temporal API is not used; date handling stays on `Date` + `date-fns`. FullCalendar is loaded through `next/dynamic` with `ssr: false` so it never enters the shared bundle (§53).

---

## ADR-004 — Client-first rendering, no server data fetching

### Context
The single source of truth is a client-side mock dataset that must mutate live and stay synchronised across Dashboard, Bookings, Calendar, Class detail and Public booking (§9, §24).

### Alternatives considered
1. Server Components reading mock modules, with client islands for interaction.
2. Client-first: the server renders the static shell, all data lives in Zustand on the client.

### Chosen solution
Option 2. `app/layout.tsx` and route shells stay server components; every data-bearing view is a client component reading Zustand selectors.

### Reason
A booking created in a dialog must instantly change the dashboard KPI, the calendar session and the class occupancy. Server-rendered data would require cache-invalidation machinery with no value in a backend-less demo.

### Consequences
No server `fetch`, no `revalidate`, no route handlers. SEO is irrelevant for an authenticated admin demo. Public `/book` is equally client-side.

---

## ADR-005 — Demo clock and hydration gate

### Context
The dataset must look current (two weeks of sessions around today), but any `new Date()` evaluated during render produces different HTML on server and client and causes hydration errors, which §52 forbids.

### Alternatives considered
1. Hard-code a fixed anchor date in the seed — the demo ages badly.
2. Generate data during render from `new Date()` — hydration mismatch.
3. Seed once on the client after mount, behind an explicit status gate.

### Chosen solution
Option 3. `useDemoRuntimeStore` holds `status: 'idle' | 'loading' | 'ready'` and `demoToday: ISODate | null`. `DemoDataProvider` calls `hydrateDemo()` in a mount effect; the seed is generated deterministically from `demoToday` plus a fixed numeric seed. Until `status === 'ready'`, data views render skeletons.

### Reason
Removes the entire class of hydration bugs, keeps the demo always current, and produces the 250–450 ms skeleton experience §46 asks for instead of faking it with timers.

### Consequences
Every data view handles the `loading` state. `Math.random()` and `Date.now()` are banned inside seed generation; a seeded PRNG (`mulberry32`) is used. Data resets on reload — accepted by §24.

---

## ADR-006 — Bookings are the ledger; volatile metrics are derived view models

### Context
The master plan's domain model puts mutable counters directly on entities: `ClassSession.booked`, `Customer.classesThisMonth`, `Customer.attendanceRate`, `Customer.lastVisit`, `Instructor.weeklySessions`. Storing those alongside a mutable booking list creates two sources of truth that drift the moment a booking is created or cancelled — which §9 forbids.

### Alternatives considered
1. Keep the counters on entities and re-sync after every mutation.
2. Keep the counters on entities but recompute inside every selector — the stale field stays readable, which is a trap.
3. Base entities hold only persistable facts; counters live on derived view models produced by pure selectors.

### Chosen solution
Option 3. `Customer`, `ClassSession` and `Instructor` carry no volatile counters. Selectors produce `CustomerWithStats`, `SessionWithOccupancy` and `InstructorWithStats`, which carry exactly the fields the master plan lists. Components consume the view models.

### Reason
Drift becomes impossible rather than merely unlikely; selectors are pure and unit-testable (§54); base entities map 1:1 to future Supabase tables.

### Consequences
Every field named in §8 still exists and is still rendered — on the view model rather than the raw entity. The mapping is documented in `/docs/04-DOMAIN-MODEL.md`. UI code never computes occupancy inline.

---

## ADR-007 — Full booking ledger, not 50–80 records

### Context
§9 suggests "50–80 bookings", while §10 requires ~80–87 % occupancy and §17 requires KPIs derived from the store, across ~6 sessions/day for two weeks (~84 sessions at capacity 12–20). Eighty bookings cannot produce 85 % occupancy over 84 sessions; the two requirements conflict.

### Alternatives considered
1. Keep 50–80 booking records and store occupancy as an independent number per session — breaks §9 and ADR-006.
2. Materialise the full ledger and derive every count from it.

### Chosen solution
Option 2. The seed generates one booking record per occupied spot across the two-week window (~1,000–1,200 small plain objects), plus cancellations and waitlist entries. "50–80" is honoured as the size of the recent/featured booking set the tables surface first.

### Reason
Single source of truth is non-negotiable (§9, §66.10). Memory cost is negligible and tables paginate anyway.

### Consequences
Documented deviation from §9's literal number, also recorded in `/docs/00-PROJECT-OVERVIEW.md`. The bookings table paginates (default 10 rows/page) and filtering uses indexed lookups built once per render, not repeated nested scans.

---

## ADR-008 — Occupancy definition

### Context
Four booking statuses exist; it must be unambiguous which consume a spot.

### Chosen solution
`confirmed` and `pending` consume a spot. `cancelled` and `waitlist` never do.

```
booked         = count(confirmed) + count(pending)
available      = max(0, capacity - booked)
occupancyRate  = booked / capacity
state          = 'full'        when available <= 0
               = 'almost_full' when occupancyRate >= 0.85 and not full
               = 'available'   otherwise
```

### Reason
A pending reservation holds the spot in a real studio; a waitlist entry by definition does not.

### Consequences
Full sessions offer the waitlist in admin and are disabled in public booking (§37). The rule lives in exactly one file: `src/domain/selectors/sessions.ts`.

---

## ADR-009 — Repositories load, stores own live state

### Context
§7 asks for `BookingRepository`-style contracts that make a future `SupabaseBookingRepository` possible, without enterprise boilerplate, while stores stay reactive.

### Chosen solution
Repositories are the data acquisition and persistence boundary: `list()`, `create()`, `cancel()`, each async with simulated latency. Zustand stores own live demo state; store actions call the repository and then update state. `hydrateDemo()` loads through repositories.

### Reason
One seam to replace for a real backend, no reactivity loss, and no generic `Repository<T>` abstraction nobody needs.

### Consequences
Store mutation actions are async and expose a mutation status so forms can block double submission (§38).

---

## ADR-010 — Auth via React context and provider strategy, not Zustand

### Context
Supabase Auth is optional; Demo Auth must take over transparently when env vars are absent (§44).

### Chosen solution
`services/auth` exports an `AuthProvider` interface with `DemoAuthProvider` and `SupabaseAuthProvider` implementations, selected by `createAuthProvider()` from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A React `AuthContext` exposes `useAuth()`. `@supabase/supabase-js` is imported lazily inside the Supabase implementation only.

### Reason
Auth has a lifecycle (session restore, async sign-in, sign-out) that belongs in a provider; keeping it out of the demo data stores keeps the swap surface small and stops Supabase code entering the bundle when unused.

### Consequences
Route protection is a client-side guard in `(admin)/layout.tsx`. This is demo-level guarding, documented as such — no middleware, no cookies, no production security claim (§44, §66.9).

---

## ADR-011 — Light theme only

### Context
The visual direction (§12, §13) specifies one pastel light palette and never asks for a dark mode.

### Chosen solution
Light only. `globals.css` defines a single palette; no `prefers-color-scheme` block and no `next-themes`.

### Reason
A second theme doubles the design-review surface for zero demo value and risks the unfinished-template feeling §69 warns against.

### Consequences
`color-scheme: light` is set explicitly so native form controls render correctly for viewers whose OS is in dark mode.

---

## ADR-012 — Heavy modules loaded dynamically

### Chosen solution
FullCalendar and every Recharts chart are imported through `next/dynamic` with `ssr: false` and a skeleton fallback. Lucide icons are imported by name.

### Reason
§53: no global FullCalendar, reasonable client bundle, no chart SSR cost, tree-shakeable icons.

### Consequences
Chart and calendar components are leaf components in their own files so the dynamic boundary stays clean.

---

## ADR-013 — Agent execution model

### Chosen solution
- **Opus 5** — architecture, documentation, file ownership, review, phase acceptance. Writes `/docs/**`, `CLAUDE.md`, `.agents/tasks.md`. Never writes application code.
- **Sonnet 5 (ultracode)** — the only writer of application code, one phase task at a time, briefed with the handoff format in §57.
- **Codex `gpt-6-astra`** (`model_reasoning_effort = max`, `--sandbox read-only`) — independent reviewer after each substantive phase, using the review format in §58. `gpt-5.6-sol` for routine passes.
- Sonnet and Codex never hold write ownership of the same file at the same time; Codex is read-only unless Opus assigns a narrowly scoped fix.

### Consequences
`/docs/12-AGENT-OWNERSHIP.md` is updated before every phase and is the authority on who may write what.

---

## ADR-016 — "Active members" is 132, derived, not the literal 148

### Context
Master plan §17 prints the dashboard KPI as `Active members / 148 / +8 this month`. Master plan §9 sizes the dataset as 148 customers and 132 active memberships. 148 is therefore the total customer count, not the active-membership count, and the same selector feeds the `/customers` page's "Active memberships" tile. Printing 148 on the dashboard while `/customers` derives 132 would put two different numbers for the same concept on two screens — the exact failure §9 forbids.

### Alternatives considered
1. Hard-code 148 on the dashboard and let `/customers` derive 132.
2. Generate 148 active customers on top of a larger roster so both screens read 148.
3. Derive the KPI from `selectActiveMembers` and let it read 132.

### Chosen solution
Option 3. `DashboardKpis.activeMembers = selectActiveMembers(customers)` = 132 with the seeded dataset; `activeMembersDelta` = `selectNewThisMonth(customers)` = 8. `/customers` shows `Total customers` 148 alongside `Active memberships` 132.

### Reason
Option 1 breaks the single source of truth. Option 2 would inflate the roster past the 148 the master plan specifies and make "148 customers" wrong instead. Option 3 keeps every §9 number intact and makes the two screens agree by construction.

### Consequences
The dashboard shows 132 where the master plan's illustrative screenshot text said 148. Documented here and in `/docs/06-ROUTES-AND-SCREENS.md` §3.2. The demo script talks about "132 active members out of 148 customers", which is a more credible business story than a single undifferentiated number.

---

## ADR-015 — Client-supplied reference frames are the graphic line

### Context
Mid-planning the client supplied four reference frames (soft lavender fitness dashboard: 24 px white cards, hatched bar chart with one ink-black highlighted bar, huge metrics with small units, pastel delta pills, ink chip bar, purple/yellow/ink category tiles, circular white icon buttons, top pill navigation).

### Alternatives considered
1. Keep the master plan's abstract description of the visual direction only.
2. Adopt the frames as the canonical visual language, reconciled with the master plan where they differ.
3. Clone the frames.

### Chosen solution
Option 2. `/docs/03-DESIGN-SYSTEM.md` encodes the frames as concrete tokens, patterns and component specs. Two explicit reconciliations:

- **Navigation.** The frames use a horizontal pill nav; master plan §15 mandates a 240 px left sidebar. The sidebar wins (it is a functional requirement for eleven admin routes); the frames' pill/ink treatment is carried into the top bar's circular icon buttons and the single ink CTA per screen.
- **Active state.** §15 requires a soft-purple active nav item, the frames use an ink-black pill. Soft purple stays on the sidebar; ink black becomes the reserved 10 % strong accent (hero CTA, highlighted chart bar, ink chip bar, one category tile).
- **Photography.** The frames use stock photos of people in the category tiles. Replaced with abstract pastel gradient waves — no licensed assets exist for this demo and §9's privacy rule discourages depicting people.

### Reason
The client named these frames the graphic line; encoding them as tokens keeps every screen consistent without copying the source composition (§12 forbids cloning).

### Consequences
`/docs/03-DESIGN-SYSTEM.md` is the authority for visual review from here on. Any screen that reads as stock shadcn, or that introduces a colour outside the token block, fails review.

---

## ADR-014 — Test tooling boundaries

### Chosen solution
Vitest + jsdom + React Testing Library for selectors, stores, form schemas and focused components; Playwright for the seven critical flows in §54. Unit tests live beside their source as `*.test.ts(x)`; Playwright specs live in `/e2e`.

### Reason
Selectors hold all demo-critical arithmetic and are pure, so they carry the highest test value per line. Playwright covers what only a browser can prove.

### Consequences
`pnpm test` never starts a browser; `pnpm test:e2e` owns the Playwright web server. Coverage targets are not enforced (§54: do not chase 100 %).

---

## ADR-017 — Serialized mutations with commit-time revalidation

### Context
The original mutation sketch checked capacity, awaited the repository, then appended to a captured array. Codex reproduced two defects: two concurrent submissions both pass the capacity check on the last spot and overbook the session, and the captured-array append silently discards a concurrent write. A UI pending flag does not impose transaction ordering.

### Alternatives considered
1. Rely on the UI pending flag.
2. Optimistic append with reconciliation afterwards.
3. Serialize mutations and re-validate inside the state updater.

### Chosen solution
Option 3, specified in `/docs/08-STATE-MANAGEMENT.md` section 8: one module-level promise chain serializes every mutating action, and the commit uses a functional `set((s) => ...)` that re-checks capacity against the live ledger and commits nothing if the spot is gone.

### Reason
It makes `booked <= capacity` a structural property rather than a race the demo usually wins. Overbooking a class in front of a gym owner is the single most damaging bug this demo could show.

### Consequences
Mutating actions are async and serialized; tests must cover two concurrent requests for one remaining spot. Waitlist promotion and cancellation follow the same protocol.

---

## ADR-018 — One demo clock: `demoNow`

### Context
The seed anchors every timestamp to 09:00 studio time on `demoToday`, but the runtime formatted relative labels against the real wall clock. The newest notification therefore read "in about 1 hour" when the demo was opened at 08:00 and "about 9 hours ago" at 18:00. FullCalendar adds a third clock of its own.

### Chosen solution
The dataset exports `demoNow`; `useDemoRuntimeStore` stores it; every relative label, every "has this session started" decision, the dashboard's notion of today, and FullCalendar's `now` and `initialDate` read it.

### Reason
One clock cannot disagree with itself. It also makes time-dependent assertions testable without freezing global time.

### Consequences
`new Date()` is confined to `hydrateDemo` (to resolve the calendar date) and to formatting helpers in `lib/dates.ts`.

---

## ADR-019 — Settings owns studio identity

### Context
`Organization` and `StudioSettings.general` both carried name, email, phone, address and timezone. Editing the address in Settings would leave the public booking confirmation showing the old one.

### Chosen solution
`useSettingsStore.general` is the live owner from hydration onwards, seeded from the `Organization` record. Every screen reads the settings store. `useCatalogStore.organization` retains only `id` and `logo`.

### Reason
The same single-source-of-truth rule ADR-006 applies to counters, applied to identity.

### Consequences
Changing the studio name in Settings visibly updates the sidebar, the public booking header and the simulated WhatsApp confirmation — which is a good demo moment rather than a bug.

---

## ADR-020 — Contrast and Tailwind v4 theme-bridge corrections

### Context
Codex measured the palette and compiled the stylesheet in memory. Three defects: white on `--color-purple` is 4.40:1 and fails AA for normal text; `--color-text-tertiary` on white is 2.52:1 yet was specified for table headers; and declaring shadcn's semantic variables on `:root` alone emits no Tailwind utilities in v4, so `bg-primary`, `bg-card`, `border-input` and `ring-ring` simply do not exist.

### Chosen solution
Primary button fill becomes `--color-purple-deep`, with `--color-purple` reserved for data marks, rails and focus rings. `--color-text-tertiary` is restricted to decorative and disabled states; anything readable uses `--color-text-secondary` or darker. Text on pastel or gradient surfaces is ink, never white. The bridge gains a matching `@theme inline` block plus the `*-foreground` tokens.

### Reason
Accessibility is completion criteria (master plan §49), and a theme bridge that emits no utilities would have been discovered as a wave of broken styling halfway through Phase 2D.

### Consequences
`/docs/03-DESIGN-SYSTEM.md` sections 5, 9 and 10 carry the corrected values. Phase 2D applies them to `globals.css` and to the Phase 2A design-system preview page.

---

## ADR-021 — Blobatar for generated avatars, tinted from our own palette

### Context
Every person in the demo needed a visual identity: 148 customers, 6 instructors, the signed-in administrator, and the avatar groups on class and session cards. The privacy rule (master plan §9) forbids real people, and no licensed photography exists for this project, so the fallback was coloured initials. The client asked for Blobatar (`blobatar.dev`) instead, tinted with our own accents rather than the library's default colours.

### Alternatives considered
1. Coloured initials, as originally specified.
2. A remote avatar service (Dicebear's hosted API, Gravatar, UI Avatars).
3. Blobatar, generated in the browser and tinted from our tokens.

### Chosen solution
Option 3. `blobatar@2.7.0`, no dependencies, React peer `>=18`, generated entirely client-side from a seed string. Verified against the published package, not the marketing page.

Option 2 was rejected outright: a demo shown live must not depend on a third-party host being reachable, and pulling avatars from an external endpoint sits badly beside a product whose whole automation story is explicitly simulated.

### Colour mapping — avatars carry meaning, not decoration
`BlobatarOptions.palette` accepts `bg`, `head` and `eye` as hex, so every avatar is tinted from `globals.css` tokens through one helper, `src/lib/avatar.ts`. No blobatar ever renders in the library's default colours.

| Subject | Accent | Reason |
|---|---|---|
| Instructor | the accent of their primary class type | Instructor 01 teaches Functional Training, so they read purple wherever they appear |
| Customer | deterministic from the customer id, cycling the five pastels | stable across the whole app, so the same person is the same colour on every screen |
| Administrator | `purple` | the brand |
| Class or session avatar group | each member keeps their own accent | the group reads as a team, not a swatch |

Tint per accent: `bg` is the soft variant, `head` the accent, `eye` `--color-ink`.

### Static by default, animated by exception
With `animate` set, the component stops being a single `<img>` and becomes inline SVG at roughly a dozen DOM nodes per avatar. A customers table holding 148 rows makes that a real cost, so:

- lists, tables and avatar groups render the static `<img>` form;
- `animate="hover"` is allowed only on the top-bar profile avatar and on detail-page headers, where there is exactly one.

### Consequences
`blobatar` is added to the approved dependency list; it is the only addition since the stack was pinned in ADR-002. Avatars stay deterministic, so they are hydration-safe and identical on every machine. `Customer.avatar` and `Instructor.avatar` stay `string | null` in the domain: `null` now means "generate a blobatar from the seed" rather than "draw initials". The initials fallback remains for the case where the library fails to load, so no avatar slot is ever empty.

---

## ADR-022 - Demo state persists for the browser session and syncs across tabs

### Context
ADR-005 seeded the dataset on every mount and held all state in memory, so "data resets on reload". Two independent reviewers then showed that this breaks the demo's climax. Master plan section 61, steps 13 to 17, is: complete a booking on the phone, return to the admin, show the reservation reflected. A presenter who switches from `/book` to `/dashboard` through the address bar, or who shows the phone in one tab and the admin in another - the natural way to present it - loses the booking, because a full navigation regenerates the dataset and every tab holds its own ledger. Master plan section 24 also asks that data "persist for the browser session", which the original decision read too narrowly.

### Alternatives considered
1. Keep in-memory state and tell presenters to navigate only through in-app links. Fragile; one keystroke in the address bar ruins the demo in front of a client.
2. Zustand `persist` middleware on each store. Scatters the snapshot across ten keys that can fall out of step with each other.
3. One versioned snapshot of all mutable demo state, written after every mutation, restored on hydration, and broadcast to other tabs.

### Chosen solution
Option 3.

- **One key**, `180f.demo.v1.<demoToday>`, in `localStorage`. Keyed by date because the dataset is anchored to `demoToday`: yesterday's ledger would sit on a schedule that no longer exists, so a new day starts clean.
- **What is saved:** every slice a user can change - bookings, customers, sessions, membership plans, automations, notifications and settings. Class types and instructors are static and are always regenerated.
- **When:** after each committed mutation, debounced to about 250 ms so a burst of changes writes once.
- **Restore:** `hydrateDemo` reads the snapshot for today inside its client effect, which keeps ADR-005's hydration safety intact, and falls back to the seed when none exists or when it fails validation. A corrupt or foreign snapshot is discarded, never trusted.
- **Across tabs:** each tab listens for the `storage` event on that key and rehydrates from the new snapshot, so a booking made on the phone tab appears in the admin tab within a moment, without a reload.
- **Reset:** a "Reset demo data" action, reachable from the Demo Mode badge and from Settings, deletes the key and re-seeds. It is the first step of the presenter's pre-flight in docs/15.

### Reason
It makes the one sequence the whole demo builds toward reliable under the way people actually present, at the cost of one small module.

### Consequences
- The serialized mutation queue of ADR-017 guarantees capacity **within a tab**. Two tabs committing the last seat in the same instant resolve last-writer-wins on the snapshot. For a single presenter that cannot happen in practice; it is recorded here rather than solved with cross-tab locking nobody needs.
- The snapshot is about 285 KB, well inside browser storage limits.
- "Data resets on reload" is removed from CLAUDE.md and docs/05. Data now resets on a new day or on an explicit reset.

---

## ADR-023 - One definition of "today's bookings", shared by every screen

### Context
Codex ran the seed and found the dashboard disagreeing with itself: the Today's bookings KPI read 86 while the weekly chart's bar for today read 84, and cancelling a booking moved the chart to 83 but left the KPI at 86. Two surfaces were counting "bookings today" with two definitions - one including cancelled and waitlisted records, one not. That is precisely the failure CLAUDE.md lists as grounds for rejecting work.

### Chosen solution
**A booking counts toward a day when its session is on that day and its status is `confirmed` or `pending`** - the same rule that decides whether it occupies a spot (ADR-008). Cancelled and waitlisted bookings never count.

- The KPI, the weekly chart, and the vs-yesterday delta all read one selector with this definition. No surface computes its own.
- The bookings table stays a ledger: its All tab shows every status, as a ledger should. Its Confirmed plus Pending tabs, filtered to today, sum to exactly the KPI.
- The KPI's supporting line says so in plain words, so the difference from the All tab is explained on screen rather than discovered by a client.

### Consequences
Cancelling a booking for today now lowers the KPI and the chart together, by one, immediately. The Playwright flow that asserts the KPI moves by exactly one on creation gains the symmetric cancellation assertion.
