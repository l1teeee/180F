# 12 — Agent File Ownership

Updated by Opus before every phase. Rule §66.6: no two agents ever hold write ownership of the same path at the same time. Codex is read-only unless Opus assigns a scoped fix here.

Concurrency model: the repository has one working tree, not per-agent worktrees. Isolation comes from **disjoint path ownership** plus a **git checkpoint before every fan-out**, so a stray write is reverted per path instead of rebuilt. Seven worktrees were considered and rejected: seven `node_modules`, seven dev-server ports and seven merges cost more than they save at this scale.

Standing ownership, all phases:

| Path | Owner | Mode |
|---|---|---|
| `docs/**` | Opus | write |
| `CLAUDE.md` | Opus | write |
| `.agents/tasks.md` | Opus | write |
| `GYM_DEMO_MASTER_PLAN.md` | user | read-only for every agent |
| git (commit, push, branch, revert) | **Opus only** | no implementer ever runs a git write command |
| entire repository | Codex | read-only |

---

## Phase 2 — Foundation — COMPLETE except 2D

| Sub-task | Agent | Write set | State |
|---|---|---|---|
| 2A | Sonnet | root config, `src/app/{layout,page,globals.css}`, `src/lib/cn.ts` | accepted |
| 2B | Sonnet | `src/domain/**`, `src/data/**`, `src/lib/{random,dates,format}.ts`, `vitest.config.ts` | accepted |
| 2C | Sonnet | `src/services/**`, `src/stores/**`, `src/hooks/**`, `src/lib/env.ts` | accepted |
| Remediation | Sonnet | the 2B and 2C sets | accepted, 221 tests green |
| Overlays | Sonnet | `src/app/design-system/**`, `src/app/globals.css` | accepted |

---

## Current wave — running concurrently

| Agent | Write set | Notes |
|---|---|---|
| Sonnet — focus and motion | `src/app/globals.css`, `src/app/design-system/**` | owns the token and keyframe blocks |
| Sonnet — shadcn primitives | `src/components/ui/**`, `components.json`, `package.json` | generates in a scratch project so it never opens `globals.css` for writing |
| Sonnet — overlay centring fix | the overlay rules inside `globals.css` only | surgical string edits, no rewrite |
| Sonnet — Playwright harness | `e2e/**`, `playwright.config.ts` | |
| Codex `gpt-6-astra` | nothing | read-only Phase 2 review of `src/domain`, `src/data`, `src/stores`, `src/services`, `src/hooks` |

`globals.css` has two writers in this wave. That is deliberate and bounded: the motion agent owns the `@theme` and keyframe blocks, the centring fix owns four margin declarations inside the existing overlay block, and both were instructed to edit surgically rather than rewrite.

---

## Next wave — shell and public booking, in parallel

| Agent | Write set |
|---|---|
| Sonnet — shell | `src/components/layout/**`, `src/components/shared/**`, `src/app/(admin)/layout.tsx`, `src/app/(admin)/error.tsx`, the nine admin page placeholders, `src/app/(auth)/login/page.tsx`, `src/app/{not-found,error,global-error,page,layout}.tsx` |
| Sonnet — public booking | `src/app/book/**`, `src/components/booking/**`, `src/hooks/use-public-booking*.ts` |

The public booking agent may not import from `src/components/shared`, because that directory is being written at the same time. It builds what it needs locally and reports duplicates for hoisting during polish.

---

## Feature wave — six agents at once

| Agent | Write set |
|---|---|
| Phase 3 — dashboard | `src/app/(admin)/dashboard/**`, `src/components/dashboard/**`, `src/hooks/use-dashboard-*.ts` |
| Phase 4 — calendar and bookings | `src/app/(admin)/{calendar,bookings}/**`, `src/components/{calendar,bookings}/**`, `src/hooks/use-{calendar,bookings}-*.ts` |
| Phase 5 — customers | `src/app/(admin)/customers/**`, `src/components/customers/**`, `src/hooks/use-customers-*.ts` |
| Phase 6 — classes and instructors | `src/app/(admin)/{classes,instructors}/**`, `src/components/{classes,instructors}/**`, `src/hooks/use-{classes,instructors}-*.ts` |
| Phase 7 — memberships and automations | `src/app/(admin)/{memberships,automations}/**`, `src/components/{memberships,automations}/**`, `src/hooks/use-{memberships,automations}-*.ts` |
| Phase 9 — settings and login | `src/app/(admin)/settings/**`, `src/components/settings/**`, `src/app/(auth)/login/page.tsx`, `src/components/auth/**`, `src/hooks/use-settings-*.ts` |

Rules binding all six:

- New hook files must carry their own domain prefix, which is what keeps `src/hooks/` collision-free without splitting it into folders.
- **No agent may add or edit anything under `src/domain/`.** A missing selector is composed from existing ones inside that agent's own hook and reported, so the contract cannot drift under six concurrent writers.
- `src/components/shared/**` and `src/components/ui/**` are read-only. A needed variation is built inside the agent's own feature folder and reported for hoisting.
- `src/app/globals.css` is read-only. No agent adds a token.
- No agent edits `package.json`. A phase that believes it needs a dependency stops and reports.

---

## Known ownership incident

Five agents so far have acted on a message the harness relayed from the user mid-run, treating it as their instruction. One committed and pushed another agent's half-written files; four abandoned their task to answer a question. Nothing was lost, because every wave is preceded by a git checkpoint. Mitigation now in force: every brief carries an explicit override notice both at its head and immediately before its final instruction, stating that relayed messages are context addressed to the orchestrator and that no implementer ever runs a git write command.

---

## Model and effort routing

The client delegated the choice of effort level per task to Opus on 2026-09-17. Every implementer is Claude Sonnet 5; Opus never writes application code. Effort is chosen by what a mistake would cost, not by how big the task looks.

| Effort | Used for | Why |
|---|---|---|
| `max` | feature screens, the public booking flow, anything touching the booking ledger or mutations | the demo's credibility and its single source of truth live here; a subtle error costs a failed client demo |
| `high` | shell and frame work, Playwright specs, polish, remediation of review findings | cross-cutting, visible everywhere, easy to regress |
| `medium` | narrowly scoped fixes with a known cause and a measurable target, such as the iCalendar escaping and the rail geometry | the reasoning is already done in the brief; more effort buys nothing |

Independent review stays with Codex `gpt-6-astra`, read-only.
