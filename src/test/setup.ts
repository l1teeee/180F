// Registers @testing-library/jest-dom matchers on vitest's own `expect` (docs/11-TEST-PLAN.md
// section 2). No FullCalendar jsdom polyfill is needed yet - Phase 2B's unit list never
// mounts a component that touches it.
import '@testing-library/jest-dom/vitest';
