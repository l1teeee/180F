# 10 — Implementation Plan

Phases follow master plan §55. No phase starts before Opus accepts the previous one. Every phase ends with a verification gate that must actually pass (§66.13, §66.14).

Verification commands (available from Phase 2A onward):

```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm test          # vitest run
pnpm build         # next build
pnpm test:e2e      # playwright test   (from Phase 10)
pnpm check         # typecheck + lint + test
```

---

## Phase 0 — Repository inspection (Opus) — DONE

Findings in `/docs/00-PROJECT-OVERVIEW.md`. Greenfield: only `GYM_DEMO_MASTER_PLAN.md`, no git history (repo initialised during this phase), Node 24.11.1, pnpm 11.5.1, Codex CLI 0.154.0 with `gpt-6-astra`.

## Phase 1 — Architecture and documentation (Opus) — DONE

All `/docs` files, `CLAUDE.md`, stack pinned and peer-verified, domain contract fixed, ownership defined.

---

## Phase 2 — Foundation (Sonnet 5 + ultracode)

Split into four sequential tasks. Sequential, not parallel: 2B depends on 2A's project existing, 2C on 2B's types, 2D on 2A's tokens and 2C's stores. One writer at a time means no worktree isolation is needed.

### 2A — Project bootstrap and design tokens
- `package.json` (pinned versions from ADR-002), `pnpm-workspace.yaml`, `tsconfig.json` (strict), `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.example`.
- `src/app/globals.css`: Tailwind v4 `@theme` with the §13 token set plus the shadcn variable bridge.
- Manrope via `next/font/google` with Inter fallback; `src/app/layout.tsx`, `src/app/page.tsx` (redirect), `src/lib/cn.ts`.
- `pnpm install` must complete with no unsatisfied peers.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm build`.

### 2B — Domain types, constants, seed data, selectors
- `src/domain/types/**`, `src/domain/constants/**`, `src/domain/schemas/**` exactly as `/docs/04-DOMAIN-MODEL.md`.
- `src/lib/random.ts` (mulberry32), `src/lib/dates.ts`, `src/lib/format.ts`.
- `src/data/**` per `/docs/05-MOCK-DATA-STRATEGY.md`, `buildDemoDataset(demoToday)` deterministic.
- `src/domain/selectors/**` per `/docs/08-STATE-MANAGEMENT.md` §4.
- Dataset invariant tests (`/docs/04-DOMAIN-MODEL.md` §7) plus occupancy selector tests, so the seed is proven before any UI consumes it.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`.

### 2C — Stores, repositories, auth, hooks
- `src/services/repositories/**` (interfaces + mock implementations + `loadDemoDataset`).
- `src/stores/**` (ten stores per `/docs/08-STATE-MANAGEMENT.md` §1).
- `src/services/auth/**` (interface, demo provider, lazy Supabase provider, factory, context) and `src/lib/env.ts`.
- `src/hooks/**`.
- Tests: `createBooking` / `cancelBooking` capacity and duplicate rules, demo auth success and failure.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`.

### 2D — App shell and shared components
- shadcn/ui primitives into `src/components/ui`, restyled to the tokens (button, card, dialog, sheet, input, select, tabs, table, badge, avatar, dropdown-menu, popover, command, switch, skeleton, tooltip, separator, label, form, sonner).
- `components/layout/**`: `AppShell`, `AppSidebar` (240 px, drawer under `lg`), `TopBar` (search, notifications, help, profile), `PageHeader`, `DemoBadge`, `DemoDataProvider`, `Providers`.
- `components/shared/**`: `StatCard`, `SectionCard`, `StatusBadge`, `SourceBadge`, `AvatarGroup`, `DataTable`, `SearchInput`, `FilterBar`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `OccupancyBar`, `ConfirmDialog`.
- `(admin)/layout.tsx` with `AuthGuard`, placeholder pages for all admin routes so navigation is never dead (§52), `not-found.tsx`, `error.tsx`, `global-error.tsx`.
- A **functional** demo login at `/login`. It cannot wait for Phase 9: `AuthGuard` ships here, so without a working sign-in every admin route is unreachable from a fresh browser and no phase between 2D and 9 can be verified (Codex M8). Phase 9 adds the split-screen visual treatment, the Supabase path and route-protection polish.
- Gate: `pnpm check` + `pnpm build`; every sidebar link resolves; no console error on `/dashboard`.

**Phase 2 review:** Codex `gpt-6-astra`, read-only, review format §58. Opus triages; Sonnet applies approved findings; Opus accepts.

---

## Phase 3 — Dashboard (Sonnet)
Header, four KPI cards, weekly bookings chart (Recharts, dynamic), class occupancy list, upcoming classes, recent bookings, skeletons, responsive 4/2/1 grid. All values from selectors.
Codex review focus: derived-data correctness, chart accessibility, responsive behaviour, TypeScript.
Gate: `pnpm check`, visual check at 1440/1280/768/390, no hydration warning.

## Phase 4 — Calendar and bookings (Sonnet)
FullCalendar (week default, month, day) via dynamic import, class-accent events, `SessionDetailsSheet`; bookings page with tabs, four filters, table, pagination, `BookingDialog` with Zod validation and capacity display; create/cancel mutations propagating everywhere.
Codex review focus: capacity consistency, duplicate booking prevention, date handling, filter correctness, re-render behaviour.
Gate: `pnpm check` + manual cross-screen consistency check (create a booking, confirm dashboard, calendar and class occupancy all move).

## Phase 5 — Customers (Sonnet)
Four KPI cards, searchable/filterable paginated table, customer detail with membership card, stats and activity timeline.
Gate: `pnpm check`.

## Phase 6 — Classes and instructors (Sonnet)
Eight class cards, class detail (KPIs, weekday chart, weekly schedule), six instructor cards, instructor detail (stats, bio, schedule, recent classes).
Gate: `pnpm check`.

## Phase 7 — Memberships and automations (Sonnet)
Four plans with local edit, four automation cards with working toggles, WhatsApp preview with simulated 800 ms "Send test" and toast.
Codex review focus: verify no real network call exists anywhere in the feature.
Gate: `pnpm check` + grep proof that no external endpoint is contacted.

## Phase 8 — Public booking (Sonnet) — HIGH PRIORITY
Mobile-first `/book` wizard: class selection, horizontal date selector, time slots with capacity (full slots disabled), customer form (RHF + Zod), confirmation screen, state synchronisation back into the admin data.
Codex `gpt-6-astra` adversarial review of the eleven cases in §55 Phase 8.
Gate: `pnpm check` + manual run of all eleven adversarial cases.

## Phase 9 — Authentication and settings (Sonnet)
Login page (split layout), demo credentials, Supabase path behind env detection, guard behaviour, settings with four sections persisted to `useSettingsStore` and reflected in the shell (studio name, branding).
Gate: `pnpm check` + app works with and without Supabase env vars set.

## Phase 10 — Tests (Sonnet)
Vitest coverage of the §54 unit list; Playwright specs for the seven flows including the mobile-viewport public booking and the admin navigation smoke test.
Gate: `pnpm test` and `pnpm test:e2e` both green, recorded in `/docs/14-PROGRESS.md`.

## Phase 11 — Polish (Sonnet)
Spacing, typography, visual consistency, tablet and mobile passes, 150–250 ms transitions, empty/loading/error states everywhere, accessibility sweep, performance pass.
Codex `gpt-6-astra` final technical review.
Gate: `pnpm check`, `pnpm build`, `pnpm test:e2e`, Lighthouse-level sanity on `/dashboard` and `/book`.

## Phase 12 — Final convergence (Opus)
Walk §65's acceptance checklist item by item against the running app, confirm every Codex finding is resolved or explicitly documented, confirm docs and README match reality, then declare completion. No completion with an open critical or high finding (§66.15).

---

## Risk register

| Risk | Mitigation |
|---|---|
| Peer conflict during `pnpm install` | Versions pre-verified (ADR-002); implementer stops and reports instead of improvising |
| FullCalendar + React 19 rendering quirks | v6.1.21 pinned (ADR-003), dynamic import, isolated component |
| Hydration mismatch from date-derived UI | Hydration gate (ADR-005) is structural, not incidental |
| Dashboard numbers disagreeing between screens | Single ledger + selectors (ADR-006/007), asserted by tests |
| shadcn output looking like default shadcn | Token bridge in Phase 2A, restyle pass in 2D, dedicated polish phase |
| Demo dataset feeling fake | Weekday/weekend profiles, per-class demand targets, mixed statuses and sources (`/docs/05-MOCK-DATA-STRATEGY.md`) |
| Scope creep into backend territory | §2.2 list is enforced at every Codex review |
