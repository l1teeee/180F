# 01 — Technologies

The approved stack (master plan §3, §5), pinned per `/docs/13-DECISIONS.md` ADR-002/ADR-003. No version here may be changed without a new ADR (master plan §0.2, §66.7). Architecture rationale lives in `/docs/02-ARCHITECTURE.md`; this document explains why each dependency was chosen and how the team is expected to use it.

---

## 1. Core

| Package | Version | ADR |
|---|---|---|
| `next` | `16.3.5` | ADR-002 |
| `react` / `react-dom` | `19.2.8` | ADR-002 |
| `typescript` | `^5.9.3`, `strict: true` | ADR-002 |

**Role in this demo.** App Router drives every route in master plan §11; server components render the static shell (sidebar chrome, page frames) while client components own all data-bearing views (ADR-004). TypeScript strict mode is the only enforcement mechanism for the domain contract in `/docs/04-DOMAIN-MODEL.md` — there is no backend to catch a shape mismatch, so the compiler is the guard rail.

**Why it fits a fast commercial demo.** App Router's layout nesting maps directly onto `(auth)` / `(admin)` / `book` route groups with zero routing code (`/docs/02-ARCHITECTURE.md` §2, §6); React 19 needs no compatibility shims for FullCalemsdar or Recharts once pinned per ADR-002/ADR-003; strict TypeScript catches the kind of silent drift ADR-006 exists to prevent, before it ever reaches the screen in front of the client.

**Why it fits a future SaaS evolution.** App Router already has the seam for real data fetching (server actions, route handlers, `revalidate`) that a production build would add without a rewrite; the domain types in `/docs/04-DOMAIN-MODEL.md` map close to 1:1 onto future Supabase tables, so strict typing carries forward rather than being demo-only scaffolding.

**Team rule.** `strict: true` is never relaxed and `any` is never used to silence an error — fix the type (master plan §52). If an existing repository had already pinned a compatible stable version, that version would have been preserved (master plan §3); this is greenfield (ADR-001), so the Next 16 template baseline is authoritative.

---

## 2. Package manager

| Package | Version | ADR |
|---|---|---|
| `pnpm` | `11.5.1`, pinned via `packageManager` in `package.json` | ADR-001, ADR-002 |

**Role in this demo.** Single lockfile (`pnpm-lock.yaml`), single install command, single source of truth for what every agent (Opus, Sonnet, Codex) runs against.

**Why it fits both.** pnpm's content-addressed store keeps install fast during iterative demo development; the same lockfile discipline is what a production monorepo would want later, so nothing changes at the tooling layer when the project evolves past a demo.

**Team rule.** If `pnpm install` reports an unsatisfiable peer, the implementer stops and reports to Opus rather than silently changing a pinned version (ADR-002, master plan §0.2). No agent switches package manager.

---

## 3. Styling

| Package | Version | ADR |
|---|---|---|
| `tailwindcss` / `@tailwindcss/postcss` | `^4.3.3` | ADR-002 |
| `shadcn/ui` | latest CLI output, restyled | — |

**Role in this demo.** Tailwind v4 is CSS-first: the entire token system in `/docs/03-DESIGN-SYSTEM.md` §1–§3 (colors, gradients, shadows, radii, spacing) is a single `@theme` block in `src/app/globals.css`. There is no `tailwind.config.js` — one file, one token source, nothing to fall out of sync.

shadcn/ui provides **editable component source**, not a component library dependency. It is a foundation only: the CLI drops button, card, dialog, sheet, input, select, tabs, table, badge, avatar, dropdown-menu, popover, command, switch, skeleton, tooltip, separator, label, form and sonner primitives into `src/components/ui/**` as owned source files (`/docs/10-IMPLEMENTATION-PLAN.md` Phase 2D). `globals.css` then maps shadcn's semantic CSS variables onto the design-system tokens (`/docs/03-DESIGN-SYSTEM.md` §9), so every primitive inherits the brand without per-component overrides — and every primitive is then individually restyled: radii to the §3 scale, shadows to `--shadow-card`, focus rings to the purple ring, default `rounded-md` replaced.

**A screen that still reads as stock shadcn — default gray palette, default radii, default shadow — is a review failure** (`/docs/03-DESIGN-SYSTEM.md` §9, master plan §3, §69). This is checked explicitly in Phase 2 and Phase 11 review.

**Why it fits a fast commercial demo.** CSS-first Tailwind means the entire visual identity is reviewable in one file; shadcn as owned source means there is no black-box npm component to fight when the client's reference frames (ADR-015) demand a specific look.

**Why it fits a future SaaS evolution.** Owned component source scales into a real design system without a migration — there is no library boundary to later break out of. Tailwind v4 tokens can be extended (dark mode, multi-tenant theming) by adding to `@theme`, not restructuring config.

**Team rule.** The `@theme` block from Phase 2A is never restructured by later phases (`/docs/12-AGENT-OWNERSHIP.md`, Phase 2D: "component-layer additions only"). No component ships with an unmodified shadcn default; no color is introduced outside the token block (ADR-015 consequences).

---

## 4. Icons

| Package | Version |
|---|---|
| `lucide-react` | `^1.47.0` |

**Role in this demo.** Every icon across sidebar nav, KPI cards, category tiles, top bar and buttons (master plan §15, §17, §27) comes from this one set for visual consistency.

**Why it fits both.** Named imports are tree-shakeable, so bundle cost scales with icons actually used, not the whole set — relevant now for demo load time (master plan §53) and later for any production bundle budget.

**Team rule.** Import by name only: `import { Calendar, Users } from 'lucide-react'`. No barrel import of the whole icon set (ADR-012, master plan §53). Class-type icon names are resolved through the whitelist map on `ClassType.icon` (`/docs/04-DOMAIN-MODEL.md` §2), never through a dynamic string lookup that could resolve to an unreviewed icon.

---

## 5. State

| Package | Version |
|---|---|
| `zustand` | `^5.0.15` |

**Role in this demo.** There is no backend, so Zustand stores *are* the backend — the single source of truth every screen reads from (`/docs/02-ARCHITECTURE.md` §1, §4). Ten focused stores are defined in `/docs/08-STATE-MANAGEMENT.md` §1: `useDemoRuntimeStore`, `useCatalogStore`, `useInstructorStore`, `useCustomerStore`, `useSessionStore`, `useBookingStore`, `useAutomationStore`, `useNotificationStore`, `useSettingsStore`, `useUiStore`.

This is what keeps Dashboard, Bookings, Calendar, Class detail and Public booking synchronized with zero backend: a booking created anywhere calls `useBookingStore.createBooking()`, which appends to the one `bookings[]` array that every KPI, chart, occupancy bar and table reads through a pure selector (ADR-006). No screen owns its own copy of a count; there is nothing to fall out of sync because there is only one array to read. See `/docs/02-ARCHITECTURE.md` §4 for the exact mutation flow and `/docs/08-STATE-MANAGEMENT.md` §4 for the full selector inventory.

**Why it fits a fast commercial demo.** No provider tree, no boilerplate actions/reducers/dispatchers — a store is a `create<T>()` call (`/docs/08-STATE-MANAGEMENT.md` §2). Master plan §0.2 explicitly bans Redux for this reason.

**Why it fits a future SaaS evolution.** Store actions already call through a repository interface (ADR-009) before mutating state; swapping `MockBookingRepository` for `SupabaseBookingRepository` changes zero component code, because components never touch the repository directly.

**Team rule.** Components select the narrowest slice possible; array/object selections use `useShallow` — selecting a whole store (`useBookingStore()`) is a review failure (`/docs/08-STATE-MANAGEMENT.md` §2). Cross-store writes happen only inside an action via `getState()`, never inside a component (§2, three permitted edges listed). No `persist` middleware on demo data (§7 forbidden patterns) — see `/docs/08-STATE-MANAGEMENT.md` for the complete store list and selector table.

---

## 6. Forms

| Package | Version |
|---|---|
| `react-hook-form` | `^7.88.0` |
| `zod` | `^4.6.5` |
| `@hookform/resolvers` | `^5.9.1` |

**Role in this demo.** Every form in the app — new booking (master plan §24), public booking customer step (§38), settings sections (§40) — uses RHF for field state and Zod schemas from `src/domain/schemas/` as the single validation source (`/docs/04-DOMAIN-MODEL.md` §4).

**Why it fits both.** RHF minimizes re-renders on uncontrolled inputs, relevant to keeping the public booking wizard fast on mobile (master plan §34); Zod schemas mirror the domain input types exactly, so the same schema that validates a demo form validates a future API payload with no rewrite.

**Team rule.** `@hookform/resolvers ^5.9.1` bridges RHF to Zod; the peer range accepts `zod ^3.25 || ^4` (ADR-002), which is why zod 4 was safe to pin. No form does ad hoc validation outside its Zod schema.

---

## 7. Charts

| Package | Version | ADR |
|---|---|---|
| `recharts` | `^3.10.1` | ADR-012 |

**Role in this demo.** The weekly bookings chart (master plan §18) and the class-detail weekday chart (§28) — restrained bar/area charts styled per `/docs/03-DESIGN-SYSTEM.md` §6 (hatch fill, one solid ink-black highlighted bar, dashed grid, annotation pill).

**Why it fits both.** Recharts composes from SVG primitives, which is what makes the reference's specific look (hatched bars, single highlighted bar, lavender annotation pill) achievable without fighting a themed chart library; that same composability is what a production analytics view would need later.

**Team rule.** Loaded through `next/dynamic` with `ssr: false` and a skeleton fallback (ADR-012) — charts never enter the server render or the initial bundle. Every chart carries a text summary alongside it for screen readers (`/docs/03-DESIGN-SYSTEM.md` §10, master plan §49); a chart is never the only source of a number.

---

## 8. Calendar

| Package | Version | ADR |
|---|---|---|
| `@fullcalendar/react` | `6.1.21` | ADR-003 |
| `@fullcalendar/core` | `6.1.21` | ADR-003 |
| `@fullcalendar/daygrid` | `6.1.21` | ADR-003 |
| `@fullcalendar/timegrid` | `6.1.21` | ADR-003 |
| `@fullcalendar/interaction` | `6.1.21` | ADR-003 |

**Role in this demo.** Powers `/calendar` (master plan §22): Week (default), Month and Day views, class-accent events, click-through to `SessionDetailsSheet`.

**The v7 plugin gap (ADR-003).** `@fullcalendar/core` and `@fullcalendar/react` publish `7.1.0`, but `daygrid`, `timegrid` and `interaction` — the view plugins this demo actually needs — are only stable at `6.1.21`; v7 exists for them solely as `beta`/`rc`, and v7 also adds a `temporal-polyfill` peer this project does not want. Shipping a client-facing demo on beta plugins was rejected outright. All five packages are pinned to `6.1.21` together; its peer range (`react ^16.7 || ^17 || ^18 || ^19`) supports React 19.2.8 without a shim.

**Why it fits a fast commercial demo.** Week/Month/Day views, drag-free click interaction and per-event styling ship out of the box — building an equivalent grid by hand was considered and rejected (ADR-003 alternative 3) as not worth the time against a fixed demo deadline.

**Why it fits a future SaaS evolution.** The pin is a version choice, not an architecture choice — when v7's view plugins reach stable, the swap is a version bump inside one component boundary (see dynamic import below), not a rewrite.

**Team rule.** Loaded through `next/dynamic` with `ssr: false` (ADR-003, ADR-012) so it never enters the shared bundle; the calendar is a leaf component in its own file to keep that dynamic boundary clean (ADR-012 consequences). Date handling stays on `Date` + `date-fns` — the FullCalendar v7 Temporal API is explicitly not used (ADR-003 consequences).

---

## 9. Dates

| Package | Version |
|---|---|
| `date-fns` | `^4.4.0` |

**Role in this demo.** All date formatting/arithmetic in `src/lib/dates.ts`, the seed generator, and selectors that group by weekday (e.g. `selectClassWeekdayBookings`, `/docs/08-STATE-MANAGEMENT.md` §4).

**Studio-local wall-clock strings, no timezone conversion.** Every date in the domain model is an `ISODate` (`'YYYY-MM-DD'`) or a plain `TimeOfDay` (`'HH:mm'`) — never a `Date` carrying a timezone offset that needs reconciling (`/docs/04-DOMAIN-MODEL.md` §1, invariant 6: "All dates are studio-local wall-clock strings; no timezone conversion happens anywhere in the demo"). This sidesteps an entire class of demo bugs (a session showing at the wrong hour for a viewer in a different timezone) that has no payoff for a single-studio demo.

**Why it fits both.** date-fns's functional, tree-shakeable API is a natural fit for pure selectors (no class instances to serialize); the wall-clock-string convention is also what a real single-timezone studio's booking system would want — timezone-aware storage only becomes necessary at multi-location scale, which is explicitly out of scope (master plan §2.2).

**Team rule.** No `Date` object crosses a store boundary carrying implicit timezone state; no library or hand-rolled code converts a studio wall-clock string through UTC. `Math.random()` / `Date.now()` are banned inside seed generation (ADR-005) — the seeded PRNG in `src/lib/random.ts` (`mulberry32`) is used instead, so the demo dataset is deterministic and reproducible across runs.

---

## 10. Authentication

| Package | Version | ADR |
|---|---|---|
| `@supabase/supabase-js` | `^2.116.0`, optional | ADR-010 |
| Demo Auth fallback | in-repo, `src/services/auth/demo-auth-provider.ts` | ADR-010 |

**Role in this demo.** `services/auth` exports an `AuthProvider` interface behind which two implementations sit: `DemoAuthProvider` and `SupabaseAuthProvider`. `createAuthProvider()` selects between them by checking `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; a React `AuthContext` exposes `useAuth()` to the rest of the app, which never imports either concrete provider directly (ADR-010, `/docs/02-ARCHITECTURE.md` §7).

**Missing env vars are the normal case, not an error.** When the two Supabase env vars are absent, the app silently and automatically falls back to `DemoAuthProvider` — this must never break the app, throw, or log a console warning that would look broken in front of a client (`/docs/02-ARCHITECTURE.md` §7: "nothing logs a warning that would look broken in front of a client"; master plan §44).

**The demo credentials always work.**
```
admin@demo.com
demo1234
```
`DemoAuthProvider` accepts exactly this pair regardless of whether Supabase is configured, so the demo is presentable with zero external setup.

**Supabase is authentication only (ADR-010).** `@supabase/supabase-js` is imported lazily, inside `SupabaseAuthProvider` alone, so it never enters the client bundle when unused. There is no Supabase database, no RLS policy, no table in this demo — see §11 below for where that would attach later.

**Why it fits a fast commercial demo.** The demo runs and presents fully with zero configuration; Supabase becomes available the moment env vars are supplied, with no code change.

**Why it fits a future SaaS evolution.** The provider interface is already the seam a real multi-user auth system would need; swapping the demo credential check for real Supabase session handling changes one implementation file, not the app shell or route guards.

**Team rule.** `(admin)/layout.tsx` renders `<AuthGuard>` as a client-side route guard only — this is demo-level guarding, stated plainly in the UI and README, never claimed as production-grade authorization (ADR-010 consequences, master plan §44, §66.9). No middleware, no cookies, no production security claim.

---

## 11. Mock data

**Strategy.** Deterministic local TypeScript datasets in `src/data/**`, generated by one seeded generator — `buildDemoDataset(demoToday)` in `src/data/seed.ts`, seeded via `mulberry32` (ADR-005) so the dataset is reproducible and never depends on `Math.random()` or render-time `Date.now()`. Full generation strategy, volume targets and demo-story shaping are in `/docs/05-MOCK-DATA-STRATEGY.md`.

**Repository abstraction as the single future-backend seam (ADR-005, ADR-007, ADR-009).** `src/data/**` is reachable from the UI only through `src/services/repositories/**` — `BookingRepository`, `CustomerRepository`, `ClassRepository`, `InstructorRepository` and siblings, each with a `Mock*Repository` implementation (`list()`, `create()`, `cancel()`, async, simulated latency). Zustand stores call repositories, never `src/data` directly (`/docs/02-ARCHITECTURE.md` §5 layering table). This single rule is what makes a future `SupabaseBookingRepository` a contained, additive change rather than a UI rewrite (master plan §7).

**Why it fits a fast commercial demo.** A believable, internally consistent dataset (~148 customers, ~1,000–1,200 booking records per ADR-007, two weeks of sessions) with zero backend to deploy or seed remotely.

**Why it fits a future SaaS evolution.** The repository interfaces are typed against the same domain model a real database would use; the seam is already drawn at exactly the layer a production swap needs.

**Team rule.** No screen hardcodes a metric independently — every derived number goes through a selector reading store state, which was populated through a repository, which read `src/data` (ADR-006, `/docs/02-ARCHITECTURE.md` §1 diagram). This ordering is enforced in every phase's code review.

---

## 12. Testing

| Package | Version | ADR |
|---|---|---|
| `vitest` | `^5.0.1` | ADR-002, ADR-014 |
| `vite` | `^8.3.0` | ADR-002 |
| `@vitejs/plugin-react` | `^6.1.1` | ADR-002 |
| `jsdom` | `^30` | ADR-002 |
| `@testing-library/react` | `^16.3.3` | ADR-002 |
| `@playwright/test` | `^1.63.0` | ADR-002, ADR-014 |

**Role in this demo.** Vitest + jsdom + React Testing Library cover selectors, stores, Zod schemas and focused components (highest test value per line, since selectors hold all demo-critical arithmetic per ADR-006/ADR-008). Playwright covers the seven critical flows in master plan §54 end to end, including the mobile-viewport public booking flow.

**Peer chain (ADR-002).** Vitest 5 accepts `vite ^6.4 || ^7 || ^8`; `@vitejs/plugin-react@6` requires `vite ^8` — this is why `vite ^8.3.0` is pinned rather than an older line. `@types/node ^24` is required because Vitest 5 needs `^22 || >=24`, above the Next template's default `^20`.

**Why it fits both.** Selector-level unit tests are cheap to write and directly assert the invariants in `/docs/04-DOMAIN-MODEL.md` §7 (booked ≤ capacity, one non-cancelled booking per customer per session, etc.) — the same invariants a production database's constraints would enforce later, so the test suite's intent survives the backend swap even though its implementation (in-memory assertions vs. DB constraints) will not.

**Team rule.** `pnpm test` never starts a browser; `pnpm test:e2e` owns the Playwright web server (ADR-014 consequences). Coverage targets are not enforced — test behavior that matters to the demo, not for its own sake (master plan §54, ADR-014). Unit tests live beside their source as `*.test.ts(x)`; Playwright specs live in `/e2e`.

---

## 13. Deployment

**Target.** Vercel (master plan §3). No deployment-specific code is required beyond what Next.js already provides — no API routes, no server actions for data, nothing that needs a custom runtime (`/docs/02-ARCHITECTURE.md` §10). `pnpm build` is the only gate that matters for deployability.

---

## FUTURE / OUT OF DEMO SCOPE

Everything below is documented for the client's roadmap conversation only. **None of it is implemented, called, or configured anywhere in this repository.**

| Technology | Where it would attach later |
|---|---|
| Supabase PostgreSQL | Behind new `Supabase*Repository` implementations (e.g. `SupabaseBookingRepository`) satisfying the same repository interfaces `Mock*Repository` implements today (ADR-009, master plan §7) — no UI or store change required. |
| Row Level Security | Applied to the Supabase tables backing those repositories, once a real multi-user/multi-tenant boundary exists — irrelevant while `AuthProvider` is the only auth surface (ADR-010). |
| Meta WhatsApp Cloud API | Would replace the static preview in `components/automations/WhatsAppPreview` (master plan §33) and the simulated "Send test" toast with a real outbound call from a server action or edge function. |
| Instagram Messaging API | Would replace the `instagram` value of `BookingSource` (`/docs/04-DOMAIN-MODEL.md` §1) from a display-only label into an actual inbound integration feeding `BookingRepository.create()`. |
| Wompi | Would attach at the membership checkout flow in `/memberships` (master plan §31), replacing the "no real payments" local `Edit plan` action with a real payment session. |
| Trigger.dev | Would run the automation triggers currently only toggled in local state in `useAutomationStore` (`/docs/08-STATE-MANAGEMENT.md` §1) — `booking_created`, `session_24h_before`, `customer_inactive_30d`, `customer_birthday` — as real scheduled/event-driven jobs. |
| Resend | Would back the `emailConfirmations` toggle already modeled in `StudioSettings.notifications` (`/docs/04-DOMAIN-MODEL.md` §2) with real outbound email. |

None of the technologies in this section are installed as dependencies, imported anywhere in `src/`, or reachable from any user action in this build.

---

## Explicitly excluded

Repeated verbatim in scope from master plan §2.2 and §3, for review-diff checking:

| Excluded |
|---|
| Production PostgreSQL database |
| Real reservation backend |
| Real WhatsApp Cloud API |
| Real Instagram API |
| Real email sending |
| Real payments |
| Wompi |
| Stripe |
| Trigger.dev (as a running integration) |
| Production queues |
| Real notification infrastructure |
| Production multi-tenancy |
| Accounting |
| Invoicing |
| Payroll |
| Inventory |
| Biometric check-in |
| Native mobile app |
| Customer push notifications |
| CRM integration |
| Microservices |
| Redis |
| Kafka |
| RabbitMQ |
| Custom backend infrastructure |
| Firebase |
| MongoDB |
| Prisma |
| Express |
| NestJS |
| Laravel |
| Unnecessary backend services |

A diff introducing any of the above, or any dependency not listed in this document, is a review failure (master plan §66.7, §66.8; ADR-002).
