// Registers @testing-library/jest-dom matchers on vitest's own `expect` (docs/11-TEST-PLAN.md
// section 2). No FullCalendar jsdom polyfill is needed yet - Phase 2B's unit list never
// mounts a component that touches it.
import '@testing-library/jest-dom/vitest';

// globals: false (vitest.config.ts) means @testing-library/react's own auto-cleanup never finds
// a global `afterEach` to hook into, so unmounted trees from one component test would otherwise
// leak into the next. Register it explicitly instead.
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useLocaleStore } from '@/stores/locale.store';

// i18n phase 1 (CLAUDE.md, docs/13-DECISIONS.md, ADR-025): Spanish is now the app's runtime
// default, but this suite asserts English accessible names on purpose, matching the Playwright
// suite (e2e/fixtures/hydration.ts) and the English-language master plan. Unit tests never mount
// LocaleProvider, so localStorage is never read - pin the store directly instead. A beforeEach
// (not a one-off call at module scope) so a test that deliberately changes the locale cannot
// leak into the next one.
beforeEach(() => {
  useLocaleStore.setState({ locale: 'en' });
});

afterEach(() => {
  cleanup();
});
