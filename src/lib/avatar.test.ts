// docs/03-DESIGN-SYSTEM.md section 13 "Avatars", ADR-021.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACCENT_HEX, ADMIN_ACCENT, ADMIN_SEED, accentForCustomerId, paletteForAccent } from './avatar';

// Reads the real @theme block so this test fails the moment ACCENT_HEX drifts from the tokens
// it claims to mirror, instead of only ever comparing this file's literals against themselves.
const GLOBALS_CSS = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

function themeToken(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(GLOBALS_CSS);
  if (!match) throw new Error(`--color-${name} not found in globals.css`);
  return match[1].toUpperCase();
}

describe('ACCENT_HEX', () => {
  it('mirrors every accent and *-soft token in globals.css', () => {
    for (const accent of Object.keys(ACCENT_HEX) as (keyof typeof ACCENT_HEX)[]) {
      expect(ACCENT_HEX[accent].accent).toBe(themeToken(accent));
      expect(ACCENT_HEX[accent].soft).toBe(themeToken(`${accent}-soft`));
    }
  });
});

describe('paletteForAccent', () => {
  it('maps bg to the soft token, head to the accent token, eye to ink', () => {
    expect(paletteForAccent('purple')).toEqual({ bg: '#DDD8FA', head: '#7869D4', eye: '#171717' });
  });

  it('uses --color-ink for every accent', () => {
    for (const accent of Object.keys(ACCENT_HEX) as (keyof typeof ACCENT_HEX)[]) {
      expect(paletteForAccent(accent).eye).toBe(themeToken('ink'));
    }
  });
});

describe('accentForCustomerId', () => {
  it('is deterministic: the same id always yields the same accent', () => {
    const first = accentForCustomerId('cus-0042');
    for (let i = 0; i < 5; i++) {
      expect(accentForCustomerId('cus-0042')).toBe(first);
    }
  });

  it('is keyed on id, not on any other value - two different ids can differ', () => {
    const ids = Array.from({ length: 148 }, (_, k) => `cus-${String(k + 1).padStart(4, '0')}`);
    const accents = new Set(ids.map(accentForCustomerId));
    // Five accents exist; 148 ids should land on more than one for the cycling to mean anything.
    expect(accents.size).toBeGreaterThan(1);
  });

  it('distributes 148 customer ids roughly evenly across the five accents', () => {
    const ids = Array.from({ length: 148 }, (_, k) => `cus-${String(k + 1).padStart(4, '0')}`);
    const counts: Record<string, number> = { purple: 0, yellow: 0, green: 0, pink: 0, blue: 0 };
    for (const id of ids) counts[accentForCustomerId(id)] += 1;

    // Perfectly even would be 29.6 per accent (148 / 5). "Roughly even" is asserted as within
    // a wide-but-meaningful band rather than pinned to one PRNG's exact output.
    for (const accent of Object.keys(counts)) {
      expect(counts[accent]).toBeGreaterThan(15);
      expect(counts[accent]).toBeLessThan(45);
    }
  });
});

describe('ADMIN_ACCENT / ADMIN_SEED', () => {
  it('is purple, seeded from the admin email (docs/03 section 13 "Seeds")', () => {
    expect(ADMIN_ACCENT).toBe('purple');
    expect(ADMIN_SEED).toBe('admin@demo.com');
  });
});
