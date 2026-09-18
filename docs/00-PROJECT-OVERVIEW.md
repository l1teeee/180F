# 00 — Project Overview

Phase 0 repository assessment and the project's north star. Owner: Opus (`/docs/12-AGENT-OWNERSHIP.md`).

---

## 1. Purpose

A gym owner opens this demo and feels: *this is what running our studio through a custom digital platform could feel like* (master plan §1). Every screen — dashboard, calendar, bookings, customers, public booking — must read as one coherent, already-working product, not a wireframe, a student CRUD exercise, or a pile of disconnected screens (master plan §69). No feature may claim capability the demo does not actually have: WhatsApp, Instagram, and payments are shown, never wired.

---

## 2. Repository assessment (state before Phase 0, verified 2026-09-17)

- The repository contained exactly one file: `GYM_DEMO_MASTER_PLAN.md` (45,472 bytes). Nothing else.
- No git repository existed. Opus ran `git init -b main` during Phase 0. Zero commits; none will be made without explicit user authorisation.
- No `package.json`, no lockfile, no `node_modules`, no `src`, no public assets, no CI configuration, no brand assets, no environment files.
- **Conclusion:** greenfield. Nothing to preserve beyond the master plan itself (ADR-001).

---

## 3. Environment (verified)

| Item | Value |
|---|---|
| OS | Windows 11 Home 10.0.26200 |
| Node | v24.11.1 |
| npm | 11.14.1 |
| pnpm | 11.5.1 |
| corepack | 0.34.2 |
| git | 2.52.0.windows.1 |
| Codex CLI | 0.154.0, model `gpt-6-astra`, `model_reasoning_effort=max` |
| opencode | 1.18.18 |
| `NEXT_PUBLIC_SUPABASE_URL` | not present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | not present |

No Supabase env vars means Demo Auth is the default path (§44, ADR-010) — this is the normal case for the demo, not a degraded one.

---

## 4. Version table

Latest published version at planning time (2026-09-17) vs. the version pinned for this project. Full reasoning in ADR-002 / ADR-003.

| Package | Latest published | Chosen | Reason |
|---|---|---|---|
| `next` | 16.3.5 | `16.3.5` | current stable, matches greenfield rule (ADR-002) |
| `react` / `react-dom` | 19.3.0 | `19.2.8` | Next 16's own template pins this version (ADR-002) |
| `typescript` | 7.0.2 | `^5.9.3` | TS 7 native port too new for `eslint-config-next@16.3.5` and the Next TS plugin (ADR-002) |
| `eslint` | 10.10.0 | `^9` | `eslint-config-next` is authored against ESLint 9 flat config (ADR-002) |
| `tailwindcss` | 4.3.3 | `^4.3.3` | latest, CSS-first `@theme` (ADR-002) |
| `vitest` | 5.0.1 | `^5.0.1` | paired with `vite ^8.3.0` and `@vitejs/plugin-react ^6.1.1`, peer chain verified (ADR-002) |
| `zod` | 4.6.5 | `^4.6.5` | latest, verified against `@hookform/resolvers` (ADR-002) |
| `lucide-react` | 1.47.0 | `^1.47.0` | latest, no deviation (ADR-002) |
| `recharts` | 3.10.1 | `^3.10.1` | latest, no deviation (ADR-002) |
| `zustand` | 5.0.15 | `^5.0.15` | latest, no deviation (ADR-002) |
| `date-fns` | 4.4.0 | `^4.4.0` | latest, no deviation (ADR-002) |
| `@playwright/test` | 1.63.0 | `^1.63.0` | latest, no deviation (ADR-002) |
| `@supabase/supabase-js` | 2.116.0 | `^2.116.0` | latest; optional, loaded lazily (ADR-002, ADR-010) |
| shadcn CLI | 4.21.0 | `4.21.0` | latest generator, output restyled per `/docs/03-DESIGN-SYSTEM.md` §9 |
| `@fullcalendar/react` / `@fullcalendar/core` | 7.1.0 | `6.1.21` | `daygrid`/`timegrid`/`interaction` plugins only stable at 6.1.21 — v7 is beta/rc for them, so **every** FullCalendar package is pinned to 6.1.21 (ADR-003) |

---

## 5. Conflicts and risks between the master plan and reality

### 5.1 Booking volume vs. required occupancy
**Conflict:** master plan §9 suggests "50–80 bookings"; §10 and §17 require ~80–87% occupancy over ~84 sessions (two weeks × ~6 sessions/day). Eighty bookings cannot fill 84 sessions to 85% at capacity 12–20 — the two requirements are mathematically incompatible.
**Resolution:** the seed materialises a full ledger (~1,000–1,200 records) and derives every screen from it; "50–80" is kept as the size of the featured/recent set the tables surface first.
**ADR:** ADR-007.

### 5.2 Volatile entity counters vs. single source of truth
**Conflict:** master plan §8 lists mutable counters directly on entities (`ClassSession.booked`, `Customer.classesThisMonth`, `Customer.attendanceRate`, `Customer.lastVisit`, `Instructor.weeklySessions`), which would create a second source of truth alongside the mutable booking list — forbidden by §9.
**Resolution:** entities hold persistable facts only; every counter is produced by a pure selector on a view model (`SessionWithOccupancy`, `CustomerWithStats`, `InstructorWithStats`). No field from §8 is lost, only relocated.
**ADR:** ADR-006.

### 5.3 FullCalendar version
**Conflict:** `@fullcalendar/react` and `@fullcalendar/core` publish 7.1.0, but the required view plugins (`daygrid`, `timegrid`, `interaction`) are only stable at 6.1.21.
**Resolution:** the entire FullCalendar package set is pinned to 6.1.21, no mixed majors.
**ADR:** ADR-003.

### 5.4 TypeScript 7 / ESLint 10 vs. the Next 16 template
**Conflict:** both are published as "latest" at planning time, but Next 16's own template pins TypeScript 5 and ESLint 9, and `eslint-config-next` is not yet compatible with either newer major.
**Resolution:** `typescript ^5.9.3`, `eslint ^9`.
**ADR:** ADR-002.

### 5.5 `create-next-app` cannot scaffold in place
**Conflict:** `create-next-app` refuses a non-empty target directory, and the repository already held `GYM_DEMO_MASTER_PLAN.md` (and later `CLAUDE.md`/`README.md`).
**Resolution:** the exact output of `create-next-app@16.3.5` was generated in a scratch directory, inspected, and reproduced by hand as the baseline config, then extended — no move/merge step, no risk to the master plan or docs.
**ADR:** ADR-001.

### 5.6 Client reference frames vs. master plan navigation and privacy rule
**Conflict:** the client's four reference frames use a horizontal pill navigation and stock photography of people; master plan §15 mandates a 240px left sidebar, and §9's privacy rule discourages depicting real or stock people.
**Resolution:** the sidebar wins as a functional requirement for eleven admin routes; the frames' pill/ink visual language is carried into the top bar's circular icon buttons and a single ink CTA per screen. Stock photography is replaced with abstract pastel gradient waves.
**ADR:** ADR-015.

### 5.7 `src/styles` vs. Tailwind v4 CSS-first tokens
**Conflict:** master plan §6 sketches a `src/styles` directory; Tailwind v4 defines design tokens CSS-first via `@theme`, so a second stylesheet location would split the token definition.
**Resolution:** all tokens live in `src/app/globals.css`; no `src/styles` directory exists. See `/docs/02-ARCHITECTURE.md` §2.
**ADR:** none — direct architecture-doc reconciliation, not a standalone decision.

### 5.8 Supabase optional and unconfigured
**Conflict:** the master plan requires an optional Supabase Auth path (§44) but no Supabase env vars are present in this environment, and the Supabase path must never break the app if later configured.
**Resolution:** `createAuthProvider()` selects `DemoAuthProvider` whenever `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent — the normal case here — while `@supabase/supabase-js` is imported lazily so the Supabase path still compiles and stays available.
**ADR:** ADR-010.

---

## 6. Scope guardrails

Master plan §2.2's "do not build" list, as a checklist a reviewer can run against any diff. Presence of any of the following in a diff is an automatic review failure (§66.8, §66.9):

- [ ] No production PostgreSQL database.
- [ ] No real reservation backend.
- [ ] No real WhatsApp Cloud API.
- [ ] No real Instagram API.
- [ ] No real email sending.
- [ ] No real payments.
- [ ] No Wompi.
- [ ] No Stripe.
- [ ] No Trigger.dev.
- [ ] No production queues.
- [ ] No real notification infrastructure.
- [ ] No production multi-tenancy.
- [ ] No accounting.
- [ ] No invoicing.
- [ ] No payroll.
- [ ] No inventory.
- [ ] No biometric check-in.
- [ ] No native mobile app.
- [ ] No customer push notifications.
- [ ] No CRM integration.
- [ ] No microservices.
- [ ] No Redis.
- [ ] No Kafka.
- [ ] No RabbitMQ.
- [ ] No custom backend infrastructure.
- [ ] No Firebase, MongoDB, Prisma, Express, NestJS, or Laravel (§3, explicitly excluded).

Future capabilities may be shown visually (Automations, WhatsApp preview) but must remain simulated and clearly labelled as such.

---

## 7. Documentation index

| File | Question it answers |
|---|---|
| `00-PROJECT-OVERVIEW.md` | What state was the repository in before Phase 0, and what environment/version/conflict facts govern every later decision? (this file) |
| `01-TECHNOLOGIES.md` | Why does each stack technology fit a fast commercial demo and a future SaaS evolution? |
| `02-ARCHITECTURE.md` | What is the shape of the system, the directory layout, and the layering rules that keep business logic out of the UI? |
| `03-DESIGN-SYSTEM.md` | What are the exact colour, shape, typography and motion tokens, and how do the client's reference frames map onto them? |
| `04-DOMAIN-MODEL.md` | What are the entity, view-model and input types, and where does every master-plan field actually live? |
| `05-MOCK-DATA-STRATEGY.md` | How is the deterministic dataset generated, and what business story does the mock data tell? |
| `06-ROUTES-AND-SCREENS.md` | What does each route render, and what does each screen contain? |
| `07-COMPONENT-ARCHITECTURE.md` | What are the component boundaries and prop contracts across the app? |
| `08-STATE-MANAGEMENT.md` | What Zustand stores exist, what selectors and hooks derive from them, and what patterns are forbidden? |
| `09-DEMO-FLOWS.md` | What are the critical interactive flows a viewer or tester walks through? |
| `10-IMPLEMENTATION-PLAN.md` | What are the implementation phases, their gates, and the verification commands? |
| `11-TEST-PLAN.md` | What gets tested at the unit and end-to-end level, and why? |
| `12-AGENT-OWNERSHIP.md` | Which agent may write which files during the current phase? |
| `13-DECISIONS.md` | What architectural decisions were made, why, and what do they cost? |
| `14-PROGRESS.md` | What phase is active, what is done, and what is the next exact action after a context reset? |
| `15-DEMO-SCRIPT.md` | What is the recommended order for presenting the demo to a gym owner? |
| `CLAUDE.md` | What must any agent re-read to resume work correctly and safely? |
| `README.md` | How does a human set up, run, and understand the project? |

---

## 8. Recovery pointer

After compaction or at the start of a new session, read in this order:

1. `CLAUDE.md`
2. `GYM_DEMO_MASTER_PLAN.md`
3. `docs/10-IMPLEMENTATION-PLAN.md`
4. `docs/13-DECISIONS.md`
5. `docs/14-PROGRESS.md`
