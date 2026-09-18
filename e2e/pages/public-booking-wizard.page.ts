// master plan sections 34-39 (Public Booking Experience, route /book, no admin sidebar,
// mobile-first). Step 1 class cards, step 2 date selector, step 3 time slots (a FULL slot must
// be disabled), step 4 Name/Phone/Email + "Confirm reservation", success screen "Your class is
// booked!" with class/date/time/location. Used by e2e/05-public-booking.spec.ts and
// e2e/06-public-booking-mobile.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class PublicBookingWizardPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly confirmReservationButton: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByRole('textbox', { name: /^name$/i });
    this.phoneInput = page.getByRole('textbox', { name: /phone/i });
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.confirmReservationButton = page.getByRole('button', { name: /confirm reservation/i });
    this.successHeading = page.getByRole('heading', { name: /your class is booked/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/book');
  }

  classCard(className: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(className, 'i') });
  }

  /** Example label: "THU 17". */
  dateOption(label: string): Locator {
    return this.page.getByRole('button', { name: label, exact: true });
  }

  /** Example label: "6:00 AM". A FULL slot must resolve to a disabled control (§37). */
  timeSlot(label: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(label, 'i') });
  }

  async fillContactInfo(details: { name: string; phone: string; email: string }): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.phoneInput.fill(details.phone);
    await this.emailInput.fill(details.email);
  }
}
