// master plan section 24 (New Booking Flow: Customer, Class, Date, Time, Instructor fields;
// capacity text like "12 / 15 spots reserved"; success toast "Booking created successfully").
// Opened from BookingsPage.newBookingButton. Used by e2e/02-new-booking.spec.ts.
import type { Locator, Page } from '@playwright/test';

export class BookingDialogPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly customerSelect: Locator;
  readonly classSelect: Locator;
  readonly dateInput: Locator;
  readonly timeSelect: Locator;
  readonly instructorSelect: Locator;
  readonly capacityText: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /new booking/i });
    this.customerSelect = this.dialog.getByRole('combobox', { name: /customer/i });
    this.classSelect = this.dialog.getByRole('combobox', { name: /class/i });
    this.dateInput = this.dialog.getByLabel(/date/i);
    this.timeSelect = this.dialog.getByRole('combobox', { name: /time/i });
    this.instructorSelect = this.dialog.getByRole('combobox', { name: /instructor/i });
    this.capacityText = this.dialog.getByText(/\d+\s*\/\s*\d+\s*spots/i);
    this.submitButton = this.dialog.getByRole('button', { name: /^(new booking|create|save)/i });
    this.successToast = page.getByText(/booking created successfully/i);
  }

  async fillAndSubmit(options: {
    customer: string;
    className: string;
    date: string;
    time: string;
    instructor: string;
  }): Promise<void> {
    await this.customerSelect.click();
    await this.page.getByRole('option', { name: options.customer }).click();
    await this.classSelect.click();
    await this.page.getByRole('option', { name: options.className }).click();
    await this.dateInput.fill(options.date);
    await this.timeSelect.click();
    await this.page.getByRole('option', { name: options.time }).click();
    await this.instructorSelect.click();
    await this.page.getByRole('option', { name: options.instructor }).click();
    await this.submitButton.click();
  }
}
