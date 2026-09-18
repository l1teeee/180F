// docs/11-TEST-PLAN.md section 4, flow 3. Page objects to use once filled in: e2e/pages/
// calendar.page.ts (CalendarPage), e2e/pages/session-sheet.page.ts (SessionDetailsSheetPage).
// Requires the auth fixture (e2e/fixtures/auth.ts).
import { test } from './fixtures/auth';

test.describe('Calendar -> Open class -> Inspect capacity', () => {
  test.fixme('the session sheet capacity matches the class detail page capacity', async () => {
    // 1. CalendarPage(authenticatedPage).goto(); openSession(className) to open the sheet.
    // 2. Read the sheet's "booked / capacity" figure (SessionDetailsSheetPage.capacityText).
    // 3. Navigate to that same session's /classes/[id]; read its occupancy figure.
    // 4. expect the two figures to be equal (ADR-006/ADR-008: one source of truth in
    //    src/domain/selectors/sessions.ts — assert the two screens agree, not a fixed number).
  });
});
