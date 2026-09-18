# 12 — Agent File Ownership

Updated by Opus before every phase. Rule §66.6: Sonnet and Codex never hold write ownership of the same file at the same time. Codex is read-only unless Opus assigns a scoped fix in this file.

Standing ownership, all phases:

| Path | Owner | Mode |
|---|---|---|
| `docs/**` | Opus | write |
| `CLAUDE.md` | Opus | write |
| `GYM_DEMO_MASTER_PLAN.md` | user | read-only for all agents |
| `.agents/tasks.md` | Opus | write |
| `README.md` | Opus (Phase 1 draft), Sonnet (command accuracy updates only, with approval) | write |
| entire repository | Codex | read-only |

---

## Phase 2 — Foundation

Active writer: **Sonnet 5 + ultracode**, one sub-task at a time.

### 2A — Bootstrap and tokens · Sonnet WRITE
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- `.gitignore`, `.env.example`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/lib/cn.ts`

### 2B — Domain and data · Sonnet WRITE
- `src/domain/types/**`, `src/domain/constants/**`, `src/domain/schemas/**`, `src/domain/selectors/**`
- `src/data/**`
- `src/lib/random.ts`, `src/lib/dates.ts`, `src/lib/format.ts`
- `src/domain/**/*.test.ts`, `src/data/**/*.test.ts`
- `vitest.config.ts`, `src/test/setup.ts`

Read-only for 2B: everything from 2A except `package.json` (dependency additions allowed only if listed in ADR-002).

### 2C — Stores, services, hooks · Sonnet WRITE
- `src/services/auth/**`, `src/services/repositories/**`
- `src/stores/**`
- `src/hooks/**`
- `src/lib/env.ts`
- matching `*.test.ts`

Read-only for 2C: `src/domain/**`, `src/data/**`, all 2A config.

### 2D — Shell and shared components · Sonnet WRITE
- `src/components/ui/**`, `src/components/layout/**`, `src/components/shared/**`
- `src/app/(admin)/**`, `src/app/(auth)/**`, `src/app/not-found.tsx`, `src/app/error.tsx`
- `components.json` (shadcn config)
- `src/app/globals.css` (component-layer additions only; the `@theme` block from 2A is not to be restructured)

Read-only for 2D: `src/domain/**`, `src/data/**`, `src/stores/**`, `src/services/**`, `src/hooks/**`.

### Codex — READ ONLY
Whole repository. Output: review document per §58, delivered to Opus. No file writes, no fixes, no dependency changes.

### Opus
`docs/**`, `CLAUDE.md`, `.agents/tasks.md`. Review only for implementation code.

---

## Phase 3 — Dashboard (planned)

### Sonnet — WRITE
- `src/app/(admin)/dashboard/**`
- `src/components/dashboard/**`
- `src/domain/selectors/dashboard.ts`
- `src/hooks/use-dashboard-*.ts`

### Read-only for Sonnet
- `src/domain/types/**`, `src/data/**`, `src/stores/**`, `src/services/**`

### Codex — READ ONLY
- entire repository

Later phases are assigned in this file immediately before they start, following the same shape: one Sonnet write set, everything else read-only, Codex read-only over the whole tree.
