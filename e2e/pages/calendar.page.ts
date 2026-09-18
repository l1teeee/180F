// master plan section 22 (Calendar: FullCalendar, Week/Month/Day views, default Week; clicking
// an event opens SessionDetailsSheet). ADR-012: FullCalendar loads with `ssr: false`, so it
// only exists after client mount - always navigate through the hydration-aware fixture.
// Used by e2e/03-calendar-capacity.spec.ts.
import { expect, type Locator, type Page } from '@playwright/test';
import { SessionDetailsSheetPage } from './session-sheet.page';

export class CalendarPage {
  readonly page: Page;
  readonly weekViewButton: Locator;
  readonly monthViewButton: Locator;
  readonly dayViewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.weekViewButton = page.getByRole('button', { name: /^week$/i });
    this.monthViewButton = page.getByRole('button', { name: /^month$/i });
    this.dayViewButton = page.getByRole('button', { name: /^day$/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/calendar');
  }

  /**
   * FullCalendar's custom event content (src/components/calendar/schedule-calendar.tsx
   * `renderEventContent`) is a plain, role-less <div> - verified against a live a11y snapshot,
   * see e2e/README.md - so the class-name/capacity text nodes it renders are the only stable,
   * non-CSS-class hook available, not a role or accessible name.
   *
   * Returns the first visible event whose own label is a plain "booked/capacity" fraction
   * (skipping any "FULL" event, whose calendar label carries no usable numbers) so its figure
   * can be compared against the session sheet's - see 03-calendar-capacity.spec.ts.
   */
  async firstOpenEvent(): Promise<{ root: Locator; fraction: string }> {
    const fractionLabel = this.page.getByText(/^\d+\/\d+$/).first();
    await expect(fractionLabel).toBeVisible();
    const fraction = (await fractionLabel.textContent())?.trim() ?? '';
    // The fraction span's own parent is renderEventContent's root div (class name span +
    // fraction span, both direct children) - see schedule-calendar.tsx.
    const root = fractionLabel.locator('xpath=..');
    return { root, fraction };
  }

  async openEvent(eventRoot: Locator): Promise<SessionDetailsSheetPage> {
    await eventRoot.click();
    return new SessionDetailsSheetPage(this.page);
  }
}
