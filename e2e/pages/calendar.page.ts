// master plan section 22 (Calendar: FullCalendar, Week/Month/Day views, default Week; clicking
// an event opens SessionDetailsSheet). ADR-012: FullCalendar loads with `ssr: false`, so it
// only exists after client mount — always navigate through the hydration-aware fixture.
// Used by e2e/03-calendar-capacity.spec.ts.
import type { Locator, Page } from '@playwright/test';
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

  event(className: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(className, 'i') });
  }

  async openSession(className: string): Promise<SessionDetailsSheetPage> {
    await this.event(className).click();
    return new SessionDetailsSheetPage(this.page);
  }
}
