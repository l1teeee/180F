# 180 Fitness Studio — Demo

A polished frontend demo of a boutique fitness studio management and class-booking platform, built to show a gym owner what running their studio through a custom digital product could feel like (master plan §1).

## Project status

**Phase 2 — Foundation**, in progress. See `CLAUDE.md` for the architecture invariants agents must not break, and `/docs/14-PROGRESS.md` for the current sub-task, completed work, and the next exact action. This is a demo build, not a finished product.

---

## Demo scope

This is a **frontend-only demo**. There is no backend and there never will be one in this repository (master plan §2, §69).

### What is real

- The full Next.js application: routing, layout, forms, validation, and every screen listed in master plan §11.
- A deterministic, seeded mock dataset that behaves like live data: creating or cancelling a booking updates the dashboard, calendar, class occupancy, and customer stats immediately, because every number is derived from one in-memory booking ledger (ADR-006, ADR-007).
- Demo authentication with real session gating on admin routes.
- Optional Supabase Auth, used for authentication only.
- Charts, calendar views, filters, search, dialogs/sheets, and the public booking wizard.
- Automated tests (Vitest + React Testing Library + Playwright) for the flows that matter to the demo.

### What is simulated

- WhatsApp and Instagram booking sources — labels on data only, no external API is called (master plan §23, §33).
- The WhatsApp confirmation/reminder preview — a static message mock with a fake "Send test" delay, never a real message (master plan §33).
- Automations (booking confirmation, reminders, birthday message) — local toggle state only, no messaging or scheduling infrastructure runs.
- Payments — membership prices are displayed; no payment gateway is integrated.
- All personal data — customers and instructors use generic labels (`Customer 01`, `Instructor 01`); no real names, emails, or phone numbers exist anywhere (master plan §9).
- Data persistence — the dataset lives in memory for the browser session only and resets on reload (ADR-005).

---

## Screenshots

> Placeholder section. Screenshots will be added once Phase 3 onward produces stable admin and public-booking screens.

| Screen | Preview |
|---|---|
| Dashboard | `[ screenshot placeholder — docs/screenshots/dashboard.png ]` |
| Calendar | `[ screenshot placeholder — docs/screenshots/calendar.png ]` |
| Bookings | `[ screenshot placeholder — docs/screenshots/bookings.png ]` |
| Public booking (mobile) | `[ screenshot placeholder — docs/screenshots/book-mobile.png ]` |

---

## Tech stack

Versions are pinned in ADR-002 and ADR-003 (`/docs/13-DECISIONS.md`). Do not change any of these without a new ADR.

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| UI library | React / React DOM | 19.2.8 |
| Language | TypeScript (strict) | ^5.9.3 |
| Styling | Tailwind CSS | ^4.3.3 |
| Styling | @tailwindcss/postcss | ^4.3.3 |
| Component foundation | shadcn/ui | heavily restyled, not stock |
| Icons | lucide-react | ^1.47.0 |
| State | Zustand | ^5.0.15 |
| Forms | React Hook Form | ^7.88.0 |
| Validation | Zod | ^4.6.5 |
| Forms | @hookform/resolvers | ^5.9.1 |
| Charts | Recharts | ^3.10.1 |
| Calendar | @fullcalendar/react, core, daygrid, timegrid, interaction | 6.1.21 (not 7.x — ADR-003) |
| Dates | date-fns | ^4.4.0 |
| Toasts | sonner | ^2.0.8 |
| Auth (optional) | @supabase/supabase-js | ^2.116.0, lazy-loaded |
| Unit / component tests | Vitest, @vitejs/plugin-react, Vite | ^5.0.1, ^6.1.1, ^8.3.0 |
| Unit / component tests | @testing-library/react, /dom, /jest-dom, /user-event | ^16.3.3, ^10.4.2, ^7, ^14.6.7 |
| E2E tests | @playwright/test | ^1.63.0 |
| Package manager | pnpm | 11.5.1 |
| Deployment | Vercel | — |

Full rationale for every version in `/docs/13-DECISIONS.md` (ADR-002, ADR-003).

---

## Demo credentials

```text
Email:    admin@demo.com
Password: demo1234
```

Sign in at `/login`. See [Environment variables](#environment-variables) for how the app decides whether to use these credentials or Supabase Auth.

---

## Local setup

### Prerequisites

- Node.js **22.12+** (built and verified on Node 24.11.1). Next 16 itself only requires 20.9, but Vitest 5 needs Node 22 or newer, so the test suite will not run below 22.12.
- pnpm **11**

### Install and run

```bash
pnpm install
pnpm dev
```

The app runs at **http://localhost:3000**.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL, for Supabase Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous/publishable key, for Supabase Auth |

Both variables are **optional**. **If the Supabase variables are not configured, the application automatically uses Demo Auth** — the demo credentials above always work, and no setup step is required to run the app (ADR-010, master plan §44). Supabase, when configured, is used for authentication only; it is never a data source in this demo (master plan §3).

---

## Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit/component tests |
| `pnpm test:e2e` | Playwright critical-flow tests |
| `pnpm check` | typecheck + lint + test |

---

## Architecture overview

Single Next.js application, no backend, no database, no API routes. Every piece of data lives in the browser and flows in one direction:

```
seed generator (pure, deterministic)
        |
        v
mock repositories  (async, simulated latency)   <-- the only future-backend seam
        |
        v
Zustand stores     (live demo state, the single source of truth)
        |
        v
pure selectors     (domain/selectors/**: every derived number)
        |
        v
hooks              (bind store slices + selectors, control re-renders)
        |
        v
React components   (presentation only)
```

A component never computes a business number inline; it calls a hook, which calls a selector over the Zustand stores. Nothing reads `src/data` except a repository, which is what keeps a future backend swap contained to one layer (ADR-009).

Full detail, including the directory layout, the layering rules table, and the route list: **`/docs/02-ARCHITECTURE.md`**.

Related docs:

- `/docs/03-DESIGN-SYSTEM.md` — visual tokens and component language
- `/docs/04-DOMAIN-MODEL.md` — entity and view-model contracts
- `/docs/08-STATE-MANAGEMENT.md` — store inventory and selector set
- `/docs/10-IMPLEMENTATION-PLAN.md` — phase-by-phase build plan
- `/docs/13-DECISIONS.md` — the full ADR log

---

## Mock data

- Generated by a **deterministic, seeded** generator (`buildDemoDataset`), never `Math.random()` or `Date.now()` (ADR-005). The same seed always produces the same dataset for a given day.
- **No real personal data.** Customers and instructors are labelled generically (`Customer 01`, `Instructor 01`, master plan §9).
- **Data resets on reload.** State lives only in memory for the browser session; nothing is written to a database (ADR-005, master plan §24).
- **One ledger is the source of truth.** All bookings are materialised as a single list; every KPI, occupancy figure, and table row is derived from that same list by pure selectors, so no two screens can ever disagree on a count (ADR-006, ADR-007).

Full strategy: `/docs/05-MOCK-DATA-STRATEGY.md`.

---

## Testing

- **Unit / component** — Vitest + React Testing Library, covering selectors, stores, status badges, capacity calculations, and form validation.
- **End-to-end** — Playwright, covering the critical flows in master plan §54: demo login, creating a booking, inspecting calendar capacity, viewing a customer profile, and completing the public booking flow (desktop and mobile viewport).

```bash
pnpm test
pnpm test:e2e
```

Coverage targets are not enforced; tests exist for behavior that matters to the demo, not for percentage (master plan §54).

---

## Deployment (Vercel)

- Framework preset: **Next.js** (auto-detected).
- Build command: `pnpm build`.
- **No environment variables required** — the app runs correctly with Demo Auth when Supabase variables are absent.

---

## Future production migration

This repository is a frontend demo. The items below are explicitly out of scope here and are documented, never implemented, per master plan §2.2 and §5:

- Supabase PostgreSQL as the real data store, with Row Level Security
- A real `BookingRepository`/`CustomerRepository`/etc. implementation (e.g. `SupabaseBookingRepository`) behind the existing repository interfaces (ADR-009) — the seam that makes this swap possible without rewriting the UI
- Meta WhatsApp Cloud API, for the booking confirmations and reminders currently simulated in the automations screen
- Instagram Messaging API
- A real payment gateway (e.g. Wompi) for membership billing
- Trigger.dev or equivalent, for scheduled/triggered production automations
- Resend or equivalent, for transactional email

None of the above exists in this codebase today. Any of it appearing in a diff is a review failure (`CLAUDE.md`, master plan §66.7–§66.9).
