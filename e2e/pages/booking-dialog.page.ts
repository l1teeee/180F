// master plan section 24 (New Booking Flow: Customer, Class, Date, Time fields; Instructor is a
// derived, read-only fact, not a field; capacity text like "12 / 15 spots reserved"; success
// toast "Booking created successfully"). Opened from BookingsPage.newBookingButton. Used by
// e2e/02-new-booking.spec.ts.
import { expect, type Locator, type Page } from '@playwright/test';

// The class catalog (docs/04-DOMAIN-MODEL.md) is fixed - unlike which sessions exist on which
// dates, the eight class TYPE names themselves never change day to day, so iterating this fixed
// list (rather than reading the Class combobox's own options first) is safe on any day.
const CLASS_TYPE_NAMES = [
  'Functional Training',
  'Cycling',
  'Yoga',
  'Pilates',
  'HIIT',
  'Strength',
  'Mobility',
  'Boxing',
] as const;

export class BookingDialogPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly customerSelect: Locator;
  readonly classSelect: Locator;
  readonly dateSelect: Locator;
  readonly timeSelect: Locator;
  readonly capacityText: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: /new booking/i });
    this.customerSelect = this.dialog.getByRole('combobox', { name: /^customer$/i });
    this.classSelect = this.dialog.getByRole('combobox', { name: /^class$/i });
    this.dateSelect = this.dialog.getByRole('combobox', { name: /^date$/i });
    this.timeSelect = this.dialog.getByRole('combobox', { name: /^time$/i });
    this.capacityText = this.dialog.getByText(/\d+\s*\/\s*\d+\s*spots reserved/i);
    // The submit label depends on whether the chosen session is full (master plan section 24):
    // "Reserve booking" normally, "Join waitlist" when it is - both are legitimate successes.
    this.submitButton = this.dialog.getByRole('button', { name: /reserve booking|join waitlist/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /^cancel$/i });
    this.successToast = page.getByText(/booking created successfully/i);
  }

  /**
   * Picks `customerName`, then tries each class type in turn until one has a session on
   * `dateLabel` (the app's own "MMM d, yyyy" format, e.g. `format(new Date(), 'MMM d, yyyy')`
   * from date-fns), and selects that session's first time slot. A full slot still books onto
   * the waitlist rather than being rejected (the dialog switches its own submit button to
   * "Join waitlist"), and a waitlist booking still counts toward the dashboard's "today's
   * bookings" KPI (src/domain/selectors/dashboard.ts counts every booking on the date,
   * regardless of status) - so any session on the target date is a valid pick here, not only
   * an available one. Returns the class type it picked.
   */
  async selectFirstSessionOnDate(customerName: string, dateLabel: string): Promise<string> {
    await this.customerSelect.click();
    await this.page.getByRole('option', { name: customerName, exact: true }).click();

    for (const className of CLASS_TYPE_NAMES) {
      await this.classSelect.click();
      await this.page.getByRole('option', { name: className, exact: true }).click();

      try {
        // Picking a class re-enables the Date combobox only once its own effect resolves the
        // class's upcoming dates - poll for that real signal instead of a fixed sleep.
        await expect(this.dateSelect).toBeEnabled({ timeout: 3_000 });
      } catch {
        continue; // this class type has no upcoming sessions scheduled at all right now
      }

      await this.dateSelect.click();
      const dateListbox = this.page.getByRole('listbox');
      await expect(dateListbox).toBeVisible();
      const dateOption = dateListbox.getByRole('option', { name: dateLabel, exact: true });
      if ((await dateOption.count()) === 0) {
        await this.page.keyboard.press('Escape');
        await expect(dateListbox).toBeHidden();
        continue;
      }
      await dateOption.click();

      await this.timeSelect.click();
      const timeListbox = this.page.getByRole('listbox');
      await expect(timeListbox).toBeVisible();
      await timeListbox.getByRole('option').first().click();
      return className;
    }

    throw new Error(`No class type has a session on ${dateLabel}; the demo dataset may have changed shape.`);
  }

  /**
   * Like selectFirstSessionOnDate, but backtracks across class types until it finds a slot that
   * is NOT full - a waitlisted booking does not move the "Today's bookings" KPI (ADR-023: only
   * confirmed/pending bookings count), so a persistence spec asserting the KPI moved by exactly
   * one needs a confirmed booking, not whichever slot happens to come first. The full/open text
   * comes from booking-dialog.tsx ("7:00 PM · FULL" vs "7:00 PM · 3/12 spots").
   *
   * Verified live (chrome-devtools, 2026-09-18): switching class types inside one dialog mount,
   * when the new class type's date list happens to repeat the same date string as the previous
   * one, leaves the Time field stuck disabled - a pre-existing BookingDialog bug outside this
   * task's write set (src/components/bookings/booking-dialog.tsx), reported separately rather
   * than fixed here. Closing and reopening the dialog between attempts (via `reopenDialog`, e.g.
   * `() => bookingsPage.newBookingButton.click()`) gives each attempt a clean mount and sidesteps
   * it entirely. Returns the class type it picked.
   */
  async selectFirstOpenSessionOnDate(customerName: string, dateLabel: string, reopenDialog: () => Promise<void>): Promise<string> {
    for (let i = 0; i < CLASS_TYPE_NAMES.length; i += 1) {
      const className = CLASS_TYPE_NAMES[i];
      if (i > 0) {
        await this.cancelButton.click();
        await expect(this.dialog).toBeHidden();
        await reopenDialog();
        await expect(this.dialog).toBeVisible();
      }

      await this.customerSelect.click();
      await this.page.getByRole('option', { name: customerName, exact: true }).click();

      await this.classSelect.click();
      await this.page.getByRole('option', { name: className, exact: true }).click();

      try {
        await expect(this.dateSelect).toBeEnabled({ timeout: 3_000 });
      } catch {
        continue; // this class type has no upcoming sessions scheduled at all right now
      }

      await this.dateSelect.click();
      const dateListbox = this.page.getByRole('listbox');
      await expect(dateListbox).toBeVisible();
      const dateOption = dateListbox.getByRole('option', { name: dateLabel, exact: true });
      if ((await dateOption.count()) === 0) {
        await this.page.keyboard.press('Escape');
        await expect(dateListbox).toBeHidden();
        continue;
      }
      await dateOption.click();

      await this.timeSelect.click();
      const timeListbox = this.page.getByRole('listbox');
      await expect(timeListbox).toBeVisible();
      const openSlot = timeListbox.getByRole('option').filter({ hasNotText: 'FULL' });
      if ((await openSlot.count()) === 0) {
        await this.page.keyboard.press('Escape');
        await expect(timeListbox).toBeHidden();
        continue; // every slot on this class/date is full - try the next class type
      }
      await openSlot.first().click();
      return className;
    }

    throw new Error(`No class type has an open (non-full) session on ${dateLabel}; the demo dataset may be fully booked.`);
  }
}
