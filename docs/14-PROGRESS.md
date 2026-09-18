# 14 — Progress

Recovery point after context compaction, restart, agent switch or interrupted session. Updated by Opus after every phase.

Last updated: 2026-09-17 (Phase 2A accepted)

# Current phase

**Phase 2 — Foundation**. 2A accepted. 2B (domain, data, selectors) and 2C (stores, services, hooks) delegated to Sonnet 5 at maximum reasoning effort and running.

# Completed

- **Phase 0 — Repository inspection (Opus).** Greenfield confirmed: the repository held only `GYM_DEMO_MASTER_PLAN.md`, with no git history. `git init -b main` executed; zero commits. Toolchain verified: Node v24.11.1, pnpm 11.5.1, git 2.52.0, Codex CLI 0.154.0 on `gpt-6-astra` with reasoning effort max. No Supabase environment variables present, so Demo Auth is the default path.
- **Phase 1 — Architecture and documentation (Opus).** Stack pinned after peer-dependency verification of every package against React 19; domain contract fixed; state architecture, selector set and hook set defined; design system encoded from the client's reference frames; phase plan, ownership map and sixteen ADRs written. All 16 /docs files, CLAUDE.md and README.md exist. A consistency audit of the whole set produced nine findings (one critical, two high, four medium, two low); all nine are resolved, the critical one via ADR-016.
- **Phase 2A — Bootstrap, design tokens, design-system preview (Sonnet 5). ACCEPTED by Opus.** Next 16.3.5 / React 19.2.8 / TypeScript 5.9.3 / Tailwind 4.3.3 installed with zero peer errors; the full token set from docs/03 lives in `src/app/globals.css`; Manrope wired; `/design-system` renders all ten sections of the visual language.

# In progress

| Work | Owner | Files | State |
|---|---|---|---|
| Phase 2B — domain types, constants, schemas, seeded dataset, selectors, invariant tests | Sonnet 5 (ultracode) | `src/domain/**`, `src/data/**`, `src/lib/{random,dates,format}.ts`, `vitest.config.ts` | running |
| Phase 2C — repositories, ten Zustand stores, auth abstraction, hooks | Sonnet 5 (ultracode) | `src/services/**`, `src/stores/**`, `src/hooks/**`, `src/lib/env.ts` | queued behind 2B |

# Pending

- Phase 2D — shadcn primitives restyled, app shell, shared components, admin route placeholders.
- Codex `gpt-6-astra` review of Phase 2, then Opus acceptance.
- Phases 3 to 12 per `/docs/10-IMPLEMENTATION-PLAN.md`.

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
