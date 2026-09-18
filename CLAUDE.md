# CLAUDE.md — 180 Fitness Studio demo

Read this first, every session. It is short on purpose.

## What this is
A frontend-only, commercially credible demo of a boutique fitness studio management and class-booking platform. It must feel like a real SaaS product in front of a gym owner. There is no backend and there never will be in this repository.

Specification: `GYM_DEMO_MASTER_PLAN.md` (client, authoritative).
Architecture kernel: `/docs/02`, `/docs/03`, `/docs/04`, `/docs/08`, `/docs/10`, `/docs/12`, `/docs/13`.

## Resuming interrupted work
Read in this order: this file, `GYM_DEMO_MASTER_PLAN.md`, `/docs/10-IMPLEMENTATION-PLAN.md`, `/docs/13-DECISIONS.md`, `/docs/14-PROGRESS.md`.

## Current phase
**Complete.** All twelve phases are done and pushed. See `/docs/14-PROGRESS.md` for the acceptance record and the verification evidence behind it.

## Stack (pinned — do not change without an ADR)
Next.js 16.3.5 App Router, React 19.2.8, TypeScript ^5.9.3 strict, pnpm 11.5.1.
Tailwind CSS ^4.3.3 (CSS-first `@theme`, no `tailwind.config.js`), shadcn/ui heavily restyled, lucide-react ^1.47.0.
Zustand ^5.0.15, React Hook Form ^7.88.0 + Zod ^4.6.5, Recharts ^3.10.1, FullCalendar **6.1.21**, date-fns ^4.4.0, sonner ^2.0.8.
Supabase Auth optional (`@supabase/supabase-js ^2.116.0`) behind an abstraction, Demo Auth fallback.
Vitest ^5 + React Testing Library + Playwright ^1.63. Deploy target Vercel.

Never add: TypeScript 7, ESLint 10, FullCalendar 7, Redux, Prisma, Firebase, MongoDB, Express, Nest, Redis, a database, a payment gateway, or any real messaging API (master plan 2.2 and 3).

## Architecture invariants
1. Client-first. No server data fetching, no route handlers, no server actions for data (ADR-004).
2. Data flows seed -> repository -> store -> pure selector -> hook -> component. Never skip a layer (docs/02 section 1).
3. Selectors are pure and never import a store. Stores never import components. Components never import `src/data` or a repository.
4. The booking ledger is the single source of truth. Volatile counters (`booked`, `classesThisMonth`, `attendanceRate`, `lastVisit`, `weeklySessions`) exist only on selector-produced view models (ADR-006).
5. Occupancy = confirmed + pending. Cancelled and waitlist never occupy a spot. Full when available <= 0, almost full at >= 0.85 (ADR-008). Defined in exactly one file: `src/domain/selectors/sessions.ts`.
6. Demo data is seeded on the client after mount behind `useDemoRuntimeStore.status`; `Math.random()` and `Date.now()` are banned in generation (ADR-005). No hydration warnings, ever.
7. FullCalendar and every chart load through `next/dynamic` with `ssr: false` (ADR-012).
8. Light theme only (ADR-011).

## Design invariants
`/docs/03-DESIGN-SYSTEM.md` is the visual authority; the client's reference frames are the graphic line (ADR-015).
Tokens live only in `src/app/globals.css`. No hex colour anywhere else. 24px cards, 1px `--color-border`, `0 4px 18px rgba(0,0,0,0.04)` shadow, Manrope, huge metrics with small units, pastel delta pills, hatched bars with one ink-black highlight, purple wave charts. Roughly 70 percent neutral, 20 percent pastel, 10 percent ink accent. A screen that looks like stock shadcn fails review.

## Routes
`/login` · `/dashboard` · `/calendar` · `/bookings` · `/customers` · `/customers/[id]` · `/classes` · `/classes/[id]` · `/instructors` · `/instructors/[id]` · `/memberships` · `/automations` · `/settings` · `/book` · `/book/[classId]` · `/design-system` (internal preview, never linked from nav).
No sidebar link may ever 404.

## Domain source of truth
`/docs/04-DOMAIN-MODEL.md`. Types live in `src/domain/types/`. Adding or renaming a field requires Opus approval.

## Mock data rules
Deterministic generator seeded with 180180, keyed on `demoToday`. Names are `Customer 01` / `Instructor 01` — no real personal data. One ledger, every number derived (`/docs/05-MOCK-DATA-STRATEGY.md`). Demo state persists for the browser session and syncs across tabs (ADR-022); it resets on a new day or through Reset demo data.

## Agent roles
- **Opus 5** — architect and orchestrator. Writes `/docs/**`, `CLAUDE.md`, `.agents/tasks.md`. Never writes application code.
- **Sonnet 5 + ultracode** — the only writer of application code, one briefed task at a time (handoff format: master plan 57).
- **Codex `gpt-6-astra`** — independent reviewer after each substantive phase, read-only, review format: master plan 58. `gpt-5.6-sol` for routine passes.

File ownership for the current phase is in `/docs/12-AGENT-OWNERSHIP.md` and is binding. Sonnet and Codex never write the same file at the same time.

## Commands
```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm check        # typecheck + lint + test
```

## Rules that get work rejected
- Claiming a phase passes without running its verification (master plan 66.13, 66.14).
- Silencing an ESLint rule or casting to `any` to force a green build.
- A number that disagrees between two screens.
- A second source of truth for any count.
- A real network call from the automations or WhatsApp preview features.
- Structural change (route, contract, store, token, technology) made by an implementer without Opus approval.

## Known issues
See `/docs/14-PROGRESS.md`. The repository is pushed to `github.com/l1teeee/180F`; the user has authorised Opus to commit and push milestones. Implementers never run a git write command - git belongs to Opus alone.
