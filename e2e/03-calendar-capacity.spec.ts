// docs/11-TEST-PLAN.md section 4, flow 3 (ADR-006/ADR-008: occupancy has exactly one source of
// truth - src/domain/selectors/sessions.ts - so the session sheet's own capacity figure must
// agree with the same session's figure on the calendar itself).
import { test, expect } from './fixtures/auth';
import { CalendarPage } from './pages/calendar.page';

test.describe('Calendar -> Open class -> Inspect capacity', () => {
  test('switching week, month and day views still opens a session whose sheet capacity matches its calendar figure', async ({
    authenticatedPage,
  }) => {
    const calendarPage = new CalendarPage(authenticatedPage);
    await calendarPage.goto();

    await expect(calendarPage.weekViewButton).toHaveAttribute('aria-pressed', 'true'); // default view

    await calendarPage.monthViewButton.click();
    await expect(calendarPage.monthViewButton).toHaveAttribute('aria-pressed', 'true');

    await calendarPage.dayViewButton.click();
    await expect(calendarPage.dayViewButton).toHaveAttribute('aria-pressed', 'true');

    await calendarPage.weekViewButton.click();
    await expect(calendarPage.weekViewButton).toHaveAttribute('aria-pressed', 'true');

    const { root: eventRoot, fraction } = await calendarPage.firstOpenEvent();
    const sheet = await calendarPage.openEvent(eventRoot);

    await expect(sheet.sheet).toBeVisible();
    const capacityText = (await sheet.capacityText.textContent()) ?? '';
    const match = /(\d+)\s*\/\s*(\d+)/.exec(capacityText);
    expect(match, `Could not read a booked/capacity figure from "${capacityText}"`).not.toBeNull();
    const sheetFraction = `${match![1]}/${match![2]}`;

    expect(sheetFraction).toBe(fraction);
  });
});
