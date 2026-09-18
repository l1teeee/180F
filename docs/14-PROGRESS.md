# 14 — Progress

Recovery point after context compaction, restart, agent switch or interrupted session. Updated by Opus after every phase.

Last updated: 2026-09-17 (Phase 2A accepted)

# Current phase

**Phase 2 complete except 2D.** Foundation committed as checkpoint 6fd3493. Execution switched to an aggressive parallel plan at the client's request: target is about 4 hours of wall clock instead of 11 sequential.

## Parallel execution plan

| Step | Agents | Owns |
|---|---|---|
| running | focus ring fix + motion system | src/app/globals.css, src/app/design-system/** |
| 1 | shadcn primitives, restyled | components.json, src/components/ui/** |
| 2 | app shell + shared components, and public booking, in parallel | src/components/{layout,shared}/**, admin routes, login; and src/app/book/**, src/components/booking/** |
| 3 | six feature agents in parallel | dashboard; calendar+bookings; customers; classes+instructors; memberships+automations; settings+login polish |
| 4 | three Codex reviews in parallel + Opus integration | read-only |
| 5 | fix agents in parallel | their own feature paths |
| 6 | Playwright tests and polish | e2e/**, then cross-cutting polish |
| 7 | Codex final audit + Opus convergence | read-only |

Concurrency safety is disjoint path ownership plus a git checkpoint before each fan-out, so a single agent straying can be reverted per path rather than rebuilt. Worktrees were considered and rejected: seven node_modules, seven ports and seven merges cost more than they save at this scale.

# Completed

- **Phase 0 and 1 (Opus).** 17 documents, 20 ADRs, domain contract, state architecture, design system from the client reference frames, phase plan, ownership map. A cross-document audit produced nine findings, all resolved.
- **Phase 2A (Sonnet). ACCEPTED.** Next 16.3.5 / React 19.2.8 / TypeScript 5.9.3 / Tailwind 4.3.3, zero peer errors. Tokens in globals.css. /design-system renders the visual language.
- **Design system overlays (Sonnet). ACCEPTED.** Six overlay patterns - form dialog, destructive confirm, side sheet, bottom sheet, command palette, message preview - each as a static specimen and a live native <dialog>. Verified by driving Chrome: focus order, inert specimens, sheet geometry, Esc and focus return. Two real bugs found and fixed during that verification.
- **Phase 2B (Sonnet). ACCEPTED.** Types, constants, Zod schemas, the deterministic dataset and the pure selector layer.
- **Phase 2C (Sonnet). ACCEPTED.** Repositories, ten Zustand stores, the auth strategy, hooks, and the ADR-017 serialized mutation queue.
- **Phase 2 remediation (Sonnet). ACCEPTED.** All fifteen Codex findings applied. **221 tests green**, up from 90.

## Dataset, verified across all seven weekday anchors

| demoToday | sessions | bookings | occupancy | full in next 3 days | almost full | active customers |
|---|---|---|---|---|---|---|
| Mon 2026-09-14 | 76 | 1176 | 0.8408 | 4 | 20 | 132 |
| Tue 2026-09-15 | 76 | 1172 | 0.8406 | 4 | 23 | 132 |
| Wed 2026-09-16 | 76 | 1177 | 0.8427 | 4 | 22 | 132 |
| Thu 2026-09-17 | 76 | 1177 | 0.8398 | 4 | 20 | 132 |
| Fri 2026-09-18 | 76 | 1170 | 0.8414 | 4 | 20 | 132 |
| Sat 2026-09-19 | 76 | 1170 | 0.8414 | 4 | 21 | 132 |
| Sun 2026-09-20 | 76 | 1171 | 0.8384 | 4 | 18 | 132 |

Exactly four full sessions on every anchor confirms the deterministic narrative pass is doing the guaranteeing, not the statistical pass getting lucky - which was Codex finding H1.

# Codex architecture verification (gpt-6-astra, read-only, before the state layer was built)

Codex reproduced the specified PRNG, compiled the stylesheet in memory and measured contrast ratios rather than reading only. Zero critical, five high, nine medium, one low. All fifteen accepted and folded into the contracts on 2026-09-17:

| ID | Finding | Resolution |
|---|---|---|
| H1 | The specified seed yields 3 full sessions in the next 3 days, not the 4 the assertion demands, on most weekday anchors | docs/05 amendment A1: a deterministic narrative pass guarantees the outcomes; tests run all seven anchors |
| H2 | Validation and commit are separated by an await, so two submissions can overbook the last spot and a captured-array append can drop a write | ADR-017: serialized mutation queue plus capacity re-check inside the functional state updater |
| H3 | Public booking creates the customer before the reservation succeeds, so a rejected booking orphans a customer and a double submit creates two identities | ADR-017 / docs/08 section 8.2: one createPublicBooking action, identity resolved by normalised email, customer and booking committed together |
| H4 | The create guard rejects full sessions outright, so admin can never add a waitlist entry, and invariant 5 breaks the moment a cancellation frees a spot | docs/04 invariant 5 reworded: fullness is required at join time only; promotion mutates the existing booking after a fresh capacity check |
| H5 | A failed hydration leaves status stuck on loading with no retry path | docs/08 section 8.4: try/catch to an error state, retry allowed, plus global-error.tsx |
| M1 | Seed clock and presentation clock disagree, so the newest notification reads "in about 1 hour" at 08:00 | ADR-018: one demoNow, used by relative labels, session eligibility and FullCalendar |
| M2 | Public customers cannot satisfy the mandatory membership field | docs/05 amendment A3: PUBLIC_DEFAULT_PLAN_ID = plan-day-pass, identity by email |
| M3 | Organization and settings both own studio identity, so editing the address leaves the confirmation stale | ADR-019: settings.general is the live owner |
| M4 | The editable booking policies (daily limit, advance window, cancellation window, waitlist toggle) had no enforcement path | docs/08 section 8.3: one selectBookingEligibility used by both the UI and the store actions |
| M5 | No cancellation timestamp exists, so the activity timeline cannot be truthful | docs/04: Booking.cancelledAt added; membership_renewed removed from ActivityKind |
| M6 | Declaring shadcn variables on :root emits no Tailwind v4 utilities, so bg-primary, bg-card, border-input and ring-ring do not exist | ADR-020: matching @theme inline block plus foreground tokens |
| M7 | White on the primary purple is 4.40:1 and tertiary text is 2.52:1, both below AA | ADR-020: purple-deep becomes the button fill, tertiary text is decorative only, ink text on pastel surfaces |
| M8 | AuthGuard ships in 2D but the login page was scheduled for Phase 9, making every admin route unreachable in between | docs/10: a functional demo login moves into 2D |
| M9 | The instructor eligibility table lists one instructor for four class types and marks an instructor off_today while scheduling them | docs/05 amendment A2: complete table, status derived from the schedule and demoNow |
| L1 | ClassType.icon typed as string cannot index the icon map under strict TypeScript | docs/04: ClassIconName union |

Codex also confirmed the architecture is viable, that ADR-006/007 correctly remove duplicated counters, that no quadratic recomputation is inherent, and it flagged that useShallow cannot stabilise arrays of freshly built view models - now recorded in docs/08 section 8.8.

# Known issues

- No git commits exist. Commits and pushes require explicit user authorisation on each occasion, so `git worktree` isolation is unavailable; parallel agents are kept safe by disjoint path ownership instead (`/docs/12-AGENT-OWNERSHIP.md`).
- `pnpm test` fails until Phase 2B creates `vitest.config.ts` and the first tests. Expected, not a defect.
- `/dashboard` does not exist until Phase 2D, so `/` temporarily redirects to `/design-system`.
- Manrope is loaded as five static weights, so the 650 section-title weight in docs/03 section 4 font-matches to 700. Phase 2D switches `next/font/google` to the variable Manrope axis so 650 renders literally.
- Next.js 16 rewrites `CLAUDE.md` with its own agent-rules block on `next dev` and `next build`. Neutralised with `agentRules: false` in `next.config.ts`; if that line is ever removed, `CLAUDE.md` is silently corrupted again.
- pnpm 11 added `minimumReleaseAgeExclude: [lucide-react@1.47.0]` to `pnpm-workspace.yaml` during install (its supply-chain delay feature, because that version is very recent). Left in place because the pinned install requires it.

# Decisions made

Sixteen ADRs in `/docs/13-DECISIONS.md`. The ones that constrain implementation most:

- **ADR-002 / ADR-003** — pinned versions: TypeScript 5 not 7, ESLint 9 not 10, FullCalendar 6.1.21 not 7 (its view plugins are still beta at v7).
- **ADR-004 / ADR-005** — client-first rendering with a hydration gate, so no date-derived HTML is ever server-rendered.
- **ADR-006 / ADR-007** — the booking ledger is the only source of truth; volatile counters live on selector-produced view models, and the ledger is fully materialised (about 1,100 records) because 50-80 bookings cannot produce 85 percent occupancy.
- **ADR-008** — occupancy counts confirmed plus pending only.
- **ADR-015** — the client's reference frames are the graphic line; sidebar stays per master plan 15, ink black becomes the reserved strong accent, no stock photography.
- **ADR-016** — the dashboard Active members KPI is derived (132 active of 148 customers), not the literal 148 the master plan printed, so it agrees with the customers page.

# Latest verification results

**Phase 2A, verified twice — by the implementer and independently by Opus:**

| Check | Result |
|---|---|
| `pnpm install` | passed, 502 packages, zero peer-dependency errors, every pinned version resolved exactly |
| `pnpm typecheck` | passed clean (the first run failed on `LayoutProps` until `pnpm exec next typegen` generated `.next/types`; root cause fixed, not silenced) |
| `pnpm lint` | passed, zero errors, zero warnings |
| `pnpm build` | passed, 3 static routes |
| `GET /` | 307 to `/design-system` |
| `GET /design-system` | 200, all ten sections present in the HTML, zero server errors or warnings |

Installed: next 16.3.5, react 19.2.8, typescript 5.9.3, tailwindcss 4.3.3, eslint 9.39.5, vitest 5.0.1, vite 8.3.0, @fullcalendar/react 6.1.21 — all exactly as ADR-002 and ADR-003 require, no fallback needed.

**Accepted deviations from the 2A brief:** six extra `@theme` tokens (four pill-text colours, the chart connector, and `--font-sans`) so no hex literal lives outside `globals.css`, which is the same rationale docs/03 already applies to `purple-deep`; `agentRules: false` in `next.config.ts`; `*.tsbuildinfo` in `.gitignore`; the preview bar chart drawn with ten bars rather than seven, since it demonstrates a pattern rather than a week.

# Current file ownership

Per `/docs/12-AGENT-OWNERSHIP.md`:

- Sonnet — Phase 2B write set: `src/domain/**`, `src/data/**`, `src/lib/{random,dates,format}.ts`, `vitest.config.ts`, `src/test/setup.ts`. Then the Phase 2C write set: `src/services/**`, `src/stores/**`, `src/hooks/**`, `src/lib/env.ts`.
- Phase 2A output (root config, `src/app/**`, `src/lib/cn.ts`) is now read-only until Phase 2D.
- Opus — `docs/**` kernel files, `CLAUDE.md`, `.agents/tasks.md`.
- Codex — read-only over the whole repository.

# Next agent

Sonnet 5 is executing 2B then 2C. Opus reviews both reports, briefs Phase 2D (shadcn primitives, app shell, shared components, admin route skeleton), then hands the whole of Phase 2 to Codex `gpt-6-astra` for independent review.

# Next exact action

1. Verify the 2B report: run `pnpm test` independently and check the reported dataset numbers against docs/05 — overall occupancy inside 0.80-0.87, all four statuses and sources present, 132 active customers.
2. Verify the 2C report: confirm the three cross-store edges and no others, and that Supabase is imported lazily.
3. Stop the background dev server before Phase 2D starts, because 2D runs its own HTTP checks on port 3000.
4. Brief Phase 2D, including the switch of Manrope to its variable axis.
