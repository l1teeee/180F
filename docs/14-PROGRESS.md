# 14 — Progress

Recovery point after context compaction, restart, agent switch or interrupted session. Updated by Opus after every phase.

Last updated: 2026-09-17 (Phase 2A accepted)

# Phase 12 - Final acceptance record

Opus walked master plan section 65 against the running application on 2026-09-18. Every line below is evidence, not assertion: where it says verified, something was executed and its output read.

## Engineering quality

| Item | Evidence |
|---|---|
| TypeScript passes | `pnpm typecheck` clean, run by Opus after the final fix round |
| Lint passes | `pnpm lint` reports zero problems, not merely zero errors |
| No silenced rules | `grep -rn "eslint-disable" src/ e2e/` returns **0**. The last one, in the calendar, was removed by fixing its dependency array honestly |
| Unit and component tests pass | **385 of 385**, 24 files |
| Playwright critical flows pass | **17 passed, 9 skipped by project guard, 0 failed**, stable across repeated runs |
| Production build passes | `pnpm build` succeeds: 18 routes, static except the three dynamic detail routes |
| No blocking console errors | Reviewers checked every screen live; the only console line anywhere is a Next.js font-preload notice that does not appear in production |
| No hydration warnings | None on any route, which the hydration gate of ADR-005 makes structural rather than incidental |
| Independent review completed | Codex `gpt-6-astra` reviewed the architecture and the foundation with executable probes; a five-lens adversarial panel audited the finished product |
| Findings resolved or documented | 25 panel findings, all closed. Earlier rounds closed 15 architecture findings, 9 documentation findings and 2 foundation probes |

## Routes

All sixteen respond, verified by request: `/` redirects (307), the fourteen application routes and `/design-system` return 200, an unknown path returns 404. No sidebar link 404s.

## Product behaviour

| Area | Evidence |
|---|---|
| Demo login, Supabase optional | Demo credentials work; the app runs identically with and without Supabase environment variables, which are absent here |
| Dashboard derived from shared state | KPI, weekly chart and the bookings table's Confirmed plus Pending tabs all read 80 for the same day and move together on create and cancel (ADR-023) |
| One session, six surfaces | A session read 13/15 "Almost full" identically on the dashboard card, the raw ledger counted by hand, calendar week and day views, the session sheet and the instructor's own page |
| Booking lifecycle | Create, cancel and waitlist promotion each update every counter immediately; overbooking is refused at commit time even under concurrent submission (ADR-017) |
| Public booking | Full sessions disabled, validation enforced, double submission impossible, confirmation shows the committed booking |
| Cross-tab persistence | A booking made in one tab appears in another without a reload, through the shared snapshot and storage event (ADR-022) |
| Automations simulated | No network call exists anywhere in the feature; the simulated nature is labelled on screen |
| Accessibility | Skip link, heading structure, distinct landmark names, AA contrast on every readable token, 40px tap targets, focus returned on dialog close, charts carry text summaries |

## Deviations from the master plan, all recorded as ADRs

Twenty-four decisions in `/docs/13-DECISIONS.md`. The ones a reader should know about: the booking ledger is fully materialised because 50-80 bookings cannot produce 85 percent occupancy (ADR-007); volatile counters live on view models rather than entities (ADR-006); the dashboard's Active members reads 132 rather than the master plan's illustrative 148, so it agrees with the customers page (ADR-016); demo state persists and syncs across tabs rather than resetting on reload, because the demo's climax depends on it (ADR-022).

## One process deviation

The master plan assigns the final technical audit to Codex. Codex exhausted its usage quota twice during the build, so the pre-convergence audit was performed by a five-lens adversarial panel of Claude agents instead, and the Codex audit was run afterwards when its quota returned. This is recorded because a reviewer auditing work produced by the same model family is less independent than the plan intends.

---

# Current phase

**Phase 12 - Convergence.** All build phases are complete and committed. One fix round is running to close two lifecycle defects that the Codex final audit reproduced: customer identity reuse after a reload, and waitlist promotion checking capacity but not the remaining eligibility rules. Last updated 2026-09-18, about 09:00.

## Phase status

| Phase | State | Commit |
|---|---|---|
| 0 Inspection, 1 Architecture | done | 6fd3493 |
| 2 Foundation, remediation, design system, motion, overlays, primitives, Playwright harness | done | 6fd3493 .. e753441 |
| 2D Shell, shared components, public booking | done | c3b422f |
| Floating frame, blobatar avatars, collapsible rail, rail geometry | done | 27b248f, d46c001 |
| 3 Dashboard, 4 Calendar and bookings, 5 Customers, 6 Classes and instructors, 7 Memberships and automations, 9 Settings and login | done, built in parallel | 999e42a |
| Fix round 1 - dialog centring, mobile bottom sheet, shared follow-ups | done | d0da296 |
| 10 Tests - seven Playwright flows, unit gaps | done | a434d68 |
| Fix round 2 - persistence across tabs, one definition of today's bookings, calendar hour, public booking hardening | done | f9d35df |
| 11 Polish | done | 32c0414 |
| Final review panel, 25 findings, all closed | done | 5477287 |
| Codex final audit and 12 Convergence | in progress | |

## Latest verification (after the final review fixes, run by Opus)

| Gate | Result |
|---|---|
| `pnpm typecheck` | clean |
| `pnpm lint` | zero problems |
| `pnpm test` | 385 of 385 |
| `pnpm test:e2e` | 17 passed, 9 skipped by project guard, 0 failed |
| `pnpm build` | passes, 18 routes |
| `grep -rn "eslint-disable" src/ e2e/` | 0 |

## Next exact action

1. Verify the lifecycle fix round: identity cannot be reused after a reload or across tabs, and promotion honours every eligibility rule. Run the full gate including e2e and the production build.
2. Commit, push, and reconcile this file.
3. Declare Phase 12 complete only if no critical or high finding remains open (master plan 66.15).

# Interruption on 2026-09-17, about 22:40

The Claude session hit its usage limit while eight agents were running. All of them failed at once. Nothing was lost that mattered: the six feature agents had written nothing yet, and the avatar and collapsible-sidebar work had already been committed in `c3b422f` because that agent was still writing when the milestone was taken. Only the floating-frame work was left half-done in the working tree.

Recovery at 23:03, after the limit reset: dev server restarted, eight agents relaunched - the six feature screens, a finisher for the frame and four shell follow-ups, and the iCalendar escaping fix below.

## Security review finding: iCalendar property injection

`src/components/booking/booking-success.tsx` concatenated the studio address and the class name straight into `.ics` property lines. Both are editable in the app, so CR or LF characters in them would splice arbitrary properties into the calendar file.

Graded honestly: exploitability is low, because settings are local unpersisted state and the only person able to inject is the administrator in their own browser. But it is also a real correctness bug with our own seeded data - the seeded address contains a comma, which RFC 5545 requires to be escaped in TEXT values, so the file generated until now was technically invalid. Fixed with a dedicated escaping helper and tests.

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

# Client requests received mid-build

- **Blobatar avatars** (ADR-021, docs/03 section 13). Generated in the browser, tinted from our tokens, accent carries meaning: instructors take their primary class type's accent, customers a deterministic one from their id.
- **Collapsible sidebar** (docs/03 section 14). A 64 px rail of circular icon buttons with an ink primary action, tooltips for labels, and the collapsed state persisted per viewer.

Both are queued to land before the six-agent feature wave, so every screen is built against them rather than retrofitted.

# Known issues

## Carried forward, to be fixed before Phase 12

- `src/components/ui/select.tsx`: the Radix `SelectTrigger` renders a button with an unconditional `outline-none` and only shows a purple border on its own open state, so a keyboard user tabbing to it sees nothing. Currently unused anywhere, therefore inert - but it must be fixed before any screen wires a select in.
- The `/design-system` page overflows horizontally at 390 px: the data-surfaces table carries `min-w-[560px]` and the static overlay specimens are fixed-pixel. It is an internal reference page, not part of the demo narrative, so this is polish-phase work.
- Codex exhausted its usage quota at roughly 22:00 and resets at 23:32. Its executable probes against the foundation completed and are recorded above; the three screen reviews are deferred until the quota returns, or will be run as adversarial Claude reviews if the schedule demands it.
- Five agents so far have acted on a message the harness relayed from the user mid-run, treating it as their instruction rather than context. One committed and pushed another agent's half-written files. Every brief now carries an override notice at its head and immediately before its final instruction.

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
