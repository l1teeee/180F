// docs/11-TEST-PLAN.md section 4, flow 6. Same wizard as flow 5 (e2e/05-public-booking.spec.ts)
// but asserts the mobile-specific layout contract instead of re-walking the whole flow. Runs
// at the "mobile" project's 390x844 viewport (playwright.config.ts). Once real, start each
// test with `test.skip(({ isMobile }) => !isMobile, 'mobile-only, see flow 5 for desktop')` so
// this file exercises only the mobile project (both projects otherwise run every spec).
import { test } from './fixtures/hydration';

test.describe('Public booking on mobile viewport', () => {
  test.fixme('the public booking wizard has no horizontal scroll at 390x844', async () => {
    // 1. PublicBookingWizardPage(page).goto() (page is already 390x844 under the mobile
    //    project — no manual page.setViewportSize needed).
    // 2. expect(page.evaluate(() => document.documentElement.scrollWidth) to equal
    //    document.documentElement.clientWidth (no horizontal overflow), at each wizard step.
  });

  test.fixme('tap targets in the wizard do not overlap at mobile width', async () => {
    // 1. At the class-selection and time-slot steps, read each interactive control's
    //    bounding box (locator.boundingBox()) and assert no two intersect.
  });

  test.fixme('the public shell renders with no admin sidebar', async () => {
    // 1. expect no element with the admin sidebar's accessible role/name (AppShellPage's nav
    //    links) is present on /book (master plan section 34: "no admin sidebar").
  });
});
