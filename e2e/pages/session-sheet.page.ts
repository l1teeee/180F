// master plan section 22: SessionDetailsSheet content (class, date, time, instructor, room,
// capacity, bookings, available spots) and actions (View bookings, Edit class). Opened via
// CalendarPage.openSession. Used by e2e/03-calendar-capacity.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class SessionDetailsSheetPage {
  readonly page: Page;
  readonly sheet: Locator;
  readonly capacityText: Locator;
  readonly viewBookingsButton: Locator;
  readonly editClassButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sheet = page.getByRole('dialog', { name: /session/i });
    this.capacityText = this.sheet.getByText(/\d+\s*\/\s*\d+\s*spots reserved/i);
    // Rendered as <Button asChild><Link>...</Link></Button> (src/components/calendar/
    // session-details-sheet.tsx), i.e. a real <a> - its ARIA role is "link", not "button".
    this.viewBookingsButton = this.sheet.getByRole('link', { name: /view bookings/i });
    this.editClassButton = this.sheet.getByRole('button', { name: /edit class/i });
  }
}
