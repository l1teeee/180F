// docs/03-DESIGN-SYSTEM.md section 13 "Avatars", ADR-021. The only place a blobatar palette
// is constructed - every avatar in the app resolves its accent and its tint through this file.
import type { AccentToken } from '@/domain/types';
import { createStream } from '@/lib/random';

/*
 * Mirrors the five accent tokens in src/app/globals.css's @theme block (docs/03 section 1).
 * This file is plain TypeScript, so it cannot read a CSS custom property at build time - these
 * ten hex values are duplicated here on purpose, kept to this one tiny map, and avatar.test.ts
 * asserts they stay byte-identical to globals.css. Update both places together if a token's hex
 * value ever changes.
 */
export const ACCENT_HEX: Record<AccentToken, { accent: string; soft: string }> = {
  purple: { accent: '#7869D4', soft: '#DDD8FA' },
  yellow: { accent: '#F5D889', soft: '#FFF4D3' },
  green: { accent: '#BFE5CA', soft: '#E7F5EB' },
  pink: { accent: '#F2C9D3', soft: '#FCEFF3' },
  blue: { accent: '#D8E6F6', soft: '#EDF4FC' },
};

// Mirrors --color-ink.
const INK_HEX = '#171717';

export interface BlobatarPalette {
  bg: string;
  head: string;
  eye: string;
}

// docs/03 section 13 "Tint": bg is the accent's soft token, head the accent, eye --color-ink.
export function paletteForAccent(accent: AccentToken): BlobatarPalette {
  const hex = ACCENT_HEX[accent];
  return { bg: hex.soft, head: hex.accent, eye: INK_HEX };
}

// Fixed order only matters for even distribution, not for meaning (docs/03 section 13 "Seeds").
const CUSTOMER_ACCENT_CYCLE: AccentToken[] = ['purple', 'yellow', 'green', 'pink', 'blue'];

// Same demo seed CLAUDE.md's mock-data generator uses (180180), so this reuses the existing
// deterministic stream (src/lib/random.ts) instead of a second hashing implementation. Keyed
// on the customer id, never the name, so renaming a person never changes their face.
export function accentForCustomerId(customerId: string): AccentToken {
  const roll = createStream(180180, 'avatar-accent', customerId)();
  return CUSTOMER_ACCENT_CYCLE[Math.floor(roll * CUSTOMER_ACCENT_CYCLE.length)];
}

// docs/03 section 13 "Seeds": the administrator's accent and seed are both fixed.
export const ADMIN_ACCENT: AccentToken = 'purple';
export const ADMIN_SEED = 'admin@demo.com';
