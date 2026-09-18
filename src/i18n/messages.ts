// Spanish is the source of truth for the dictionary's shape (CLAUDE.md). `Messages` is derived
// from it, and en/index.ts is checked against this type with `satisfies Messages` so a missing,
// extra or misspelled English key is a compile error, not a runtime gap.
import type { es } from './dictionaries/es';

export type Messages = typeof es;
