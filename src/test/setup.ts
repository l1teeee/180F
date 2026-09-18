// Registers @testing-library/jest-dom matchers on vitest's own `expect` (docs/11-TEST-PLAN.md
// section 2). No FullCalendar jsdom polyfill is needed yet - Phase 2B's unit list never
// mounts a component that touches it.
import '@testing-library/jest-dom/vitest';

// globals: false (vitest.config.ts) means @testing-library/react's own auto-cleanup never finds
// a global `afterEach` to hook into, so unmounted trees from one component test would otherwise
// leak into the next. Register it explicitly instead.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
