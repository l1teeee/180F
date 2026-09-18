// master plan sections 34-39 (Public Booking Experience, route /book, no admin sidebar,
// mobile-first). Step 1 class cards, step 2 date buttons, step 3 time-slot buttons (a FULL slot
// is `disabled`), step 4 Name/Phone/Email + "Confirm reservation", success screen "Your class is
// booked!" with class/date/time/location. Used by e2e/05-public-booking.spec.ts and
// e2e/06-public-booking-mobile.spec.ts.
import { expect, type Locator, type Page } from '@playwright/test';

// Fixed catalog (docs/04-DOMAIN-MODEL.md) - the class TYPES themselves do not change day to
// day, only which sessions exist and how full they are, so iterating this fixed list is safe
// on any day the suite runs.
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

// e.g. "FRI 18" (date-step.tsx button label).
const DATE_BUTTON_NAME = /^[A-Z]{3} \d{1,2}$/;
// e.g. "9:30 AM" (time-step.tsx button label, with or without a trailing "FULL"/occupancy tag).
const TIME_BUTTON_NAME = /^\d{1,2}:\d{2}\s?(AM|PM)/;

export class PublicBookingWizardPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly confirmReservationButton: Locator;
  readonly successHeading: Locator;
  readonly changeClassButton: Locator;
  readonly changeDateButton: Locator;
  readonly dateStepHeading: Locator;
  readonly timeStepHeading: Locator;
  readonly classStepHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByRole('textbox', { name: /^name$/i });
    this.phoneInput = page.getByRole('textbox', { name: /phone/i });
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.confirmReservationButton = page.getByRole('button', { name: /confirm reservation/i });
    this.successHeading = page.getByRole('heading', { name: /your class is booked/i });
    this.changeClassButton = page.getByRole('button', { name: /change class/i });
    this.changeDateButton = page.getByRole('button', { name: /change date/i });
    this.dateStepHeading = page.getByRole('heading', { name: /choose a date/i });
    this.timeStepHeading = page.getByRole('heading', { name: /choose a time/i });
    this.classStepHeading = page.getByRole('heading', { name: /choose your class/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/book');
  }

  classCard(className: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(className, 'i') });
  }

  dateButtons(): Locator {
    return this.page.getByRole('button', { name: DATE_BUTTON_NAME });
  }

  timeButtons(): Locator {
    return this.page.getByRole('button', { name: TIME_BUTTON_NAME });
  }

  async fillContactInfo(details: { name: string; phone: string; email: string }): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.phoneInput.fill(details.phone);
    await this.emailInput.fill(details.email);
  }

  /**
   * Walks class -> date -> time, backtracking (via "Change date" / "Change class") whenever a
   * combination has no bookable slot, until it finds one with an enabled time slot, then clicks
   * it. Returns the class type it landed on. Backtracks rather than assuming any single
   * class/date always has room, since the seeded dataset's occupancy differs by day.
   */
  async selectFirstAvailableSession(): Promise<string> {
    for (const className of CLASS_TYPE_NAMES) {
      const classCard = this.classCard(className);
      if ((await classCard.count()) === 0) continue;
      if (!(await classCard.first().isEnabled())) continue; // "No sessions available"
      await classCard.first().click();
      await expect(this.dateStepHeading).toBeVisible();

      const dateButtons = this.dateButtons();
      const dateCount = await dateButtons.count();
      for (let i = 0; i < dateCount; i += 1) {
        const dateButton = dateButtons.nth(i);
        if (!(await dateButton.isEnabled())) continue;
        await dateButton.click();
        await expect(this.timeStepHeading).toBeVisible();

        const timeButtons = this.timeButtons();
        const timeCount = await timeButtons.count();
        for (let t = 0; t < timeCount; t += 1) {
          const timeButton = timeButtons.nth(t);
          if (await timeButton.isEnabled()) {
            await timeButton.click();
            return className;
          }
        }
        await this.changeDateButton.click(); // every slot on this date was full - try the next date
        await expect(this.dateStepHeading).toBeVisible();
      }
      await this.changeClassButton.click(); // no date for this class had room - try the next class
      await expect(this.classStepHeading).toBeVisible();
    }

    throw new Error('No class/date/time combination had an available session; the demo dataset may be fully booked.');
  }

  /**
   * Walks class -> today (the date step's first option) looking for a FULL, disabled time
   * slot, backtracking to the next class when today has none. Returns the disabled slot's
   * locator, still on the time step, for 06-public-booking-mobile.spec.ts to assert against.
   */
  async findDisabledSlotToday(): Promise<Locator> {
    for (const className of CLASS_TYPE_NAMES) {
      const classCard = this.classCard(className);
      if ((await classCard.count()) === 0) continue;
      if (!(await classCard.first().isEnabled())) continue;
      await classCard.first().click();
      await expect(this.dateStepHeading).toBeVisible();

      const dateButtons = this.dateButtons();
      if ((await dateButtons.count()) === 0) {
        await this.changeClassButton.click();
        await expect(this.classStepHeading).toBeVisible();
        continue;
      }
      await dateButtons.first().click(); // the first date option is always today
      await expect(this.timeStepHeading).toBeVisible();

      const disabledSlot = this.page.getByRole('button', { name: TIME_BUTTON_NAME, disabled: true });
      if ((await disabledSlot.count()) > 0) {
        return disabledSlot.first();
      }
      await this.changeDateButton.click();
      await expect(this.dateStepHeading).toBeVisible();
      await this.changeClassButton.click();
      await expect(this.classStepHeading).toBeVisible();
    }

    throw new Error('No class has a FULL session today; the demo dataset may have changed shape.');
  }
}
