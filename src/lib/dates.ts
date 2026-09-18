// Date/time helpers for the seed generator (src/data/**) and the selector layer
// (src/domain/selectors/**). Every ISODate here is a bare 'YYYY-MM-DD' wall-clock string.
//
// Calendar-day arithmetic (add/sub/diff/weekday/month-start/...) below parses that string
// straight into UTC epoch millis (Date.UTC), does the math there, and formats back out via
// the UTC getters (getUTCFullYear/getUTCMonth/getUTCDate/getUTCDay). It never touches a local
// getter or setter, so the host machine's timezone cannot enter the computation at any step -
// this is the "no timezone conversion" rule from docs/04-DOMAIN-MODEL.md section 7 invariant 6.
// (A local-time round trip - parseISO, then read back with local getters - happens to produce
// the same answer too, since construct and read would use the same frame either way, but it
// depends on every call site remembering never to mix in a UTC-reading or literal `new
// Date(isoString)` call. Anchoring to UTC throughout removes that trap structurally.)
//
// The three formatDisplay* functions below are the one place this file still builds a
// *local*-time Date - deliberately, and only to hand it straight to date-fns' `format()` for a
// human-readable label (month/weekday names). See `toLocalDisplayDate` for why that pair stays
// self-consistent regardless of the host timezone.
import { format, parse } from 'date-fns';
import type { ISODate, ISODateTime, TimeOfDay } from '@/domain/types';
import {
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATE_SHORT_FORMAT,
  DISPLAY_TIME_FORMAT,
  DISPLAY_WEEKDAY_SHORT_FORMAT,
} from '@/domain/constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A fixed, argument-ful reference date used only to anchor 'HH:mm' parsing/formatting -
// the calendar day is discarded, so any fixed date works.
const TIME_OF_DAY_REFERENCE = new Date(2000, 0, 1);

function parseISODateParts(date: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

// UTC epoch millis for `date` at 00:00 - the fixed reference point every calendar computation
// in this file is anchored to (see the file header).
function isoDateToUTCMillis(date: ISODate): number {
  const { year, month, day } = parseISODateParts(date);
  return Date.UTC(year, month - 1, day);
}

function utcMillisToISODate(utcMillis: number): ISODate {
  const d = new Date(utcMillis);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(date: ISODate, amount: number): ISODate {
  return utcMillisToISODate(isoDateToUTCMillis(date) + amount * MS_PER_DAY);
}

export function subDaysISO(date: ISODate, amount: number): ISODate {
  return addDaysISO(date, -amount);
}

export function startOfMonthISO(date: ISODate): ISODate {
  const { year, month } = parseISODateParts(date);
  return utcMillisToISODate(Date.UTC(year, month - 1, 1));
}

export function subMonthsISO(date: ISODate, months: number): ISODate {
  const { year, month, day } = parseISODateParts(date);
  const targetMonthIndex0 = month - 1 - months; // 0-indexed; Date.UTC normalizes any out-of-range value
  // Day 0 of (target + 1) = the last day of the target month, so a day-of-month that doesn't
  // exist there (e.g. Mar 31 minus 1 month) clamps instead of overflowing into the next month -
  // matching date-fns' addMonths/subMonths, which this replaces.
  const daysInTargetMonth = new Date(Date.UTC(year, targetMonthIndex0 + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  return utcMillisToISODate(Date.UTC(year, targetMonthIndex0, clampedDay));
}

// Calendar days from `from` to `to` (positive when `to` is later). UTC has no DST, so this
// division is always an exact integer; Math.round is just a float-safety net.
export function daysBetweenISO(from: ISODate, to: ISODate): number {
  return Math.round((isoDateToUTCMillis(to) - isoDateToUTCMillis(from)) / MS_PER_DAY);
}

export function getDayOfMonth(date: ISODate): number {
  return parseISODateParts(date).day;
}

// 0 = Sunday .. 6 = Saturday, matching date-fns getDay() (and JS's own Date#getDay()).
export function getWeekdayIndex(date: ISODate): number {
  return new Date(isoDateToUTCMillis(date)).getUTCDay();
}

export function isWeekendISO(date: ISODate): boolean {
  const day = getWeekdayIndex(date);
  return day === 0 || day === 6;
}

export function isSameISOMonth(a: ISODate, b: ISODate): boolean {
  const pa = parseISODateParts(a);
  const pb = parseISODateParts(b);
  return pa.year === pb.year && pa.month === pb.month;
}

// `n` ISO dates ending at `date` inclusive, ascending chronological order.
export function lastNISODates(date: ISODate, n: number): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(date, i - (n - 1)));
}

// Local-time construction is safe here ONLY because the formatDisplay* functions below read
// this same Date's LOCAL components right back via date-fns `format()` - construct and read
// are a symmetric pair, so whatever the host timezone is cancels out. Never reuse this Date for
// arithmetic, storage, or comparison - only for an immediate, one-shot display label.
export function toLocalDisplayDate(date: ISODate): Date {
  const { year, month, day } = parseISODateParts(date);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(date: ISODate): string {
  return format(toLocalDisplayDate(date), DISPLAY_DATE_FORMAT);
}

export function formatDisplayDateShort(date: ISODate): string {
  return format(toLocalDisplayDate(date), DISPLAY_DATE_SHORT_FORMAT);
}

export function formatWeekdayShort(date: ISODate): string {
  return format(toLocalDisplayDate(date), DISPLAY_WEEKDAY_SHORT_FORMAT);
}

export function formatDisplayTime(time: TimeOfDay): string {
  return format(parse(time, 'HH:mm', TIME_OF_DAY_REFERENCE), DISPLAY_TIME_FORMAT);
}

// Adds (or, with a negative value, subtracts) whole minutes to a 'HH:mm' time-of-day.
// Pure integer math - no Date object needed for a same-day offset like a class duration.
export function addMinutesToTimeOfDay(time: TimeOfDay, minutes: number): TimeOfDay {
  const [hh, mm] = time.split(':').map(Number);
  const total = hh * 60 + mm + minutes;
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Combines a wall-clock date + time into the fixed-offset ISODateTime shape used
// throughout the dataset ('...T09:00:00.000-05:00' - Bogota, fixed offset, no DST).
export function buildISODateTime(date: ISODate, time: TimeOfDay): ISODateTime {
  return `${date}T${time}:00.000-05:00`;
}

const ISO_DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})(-05:00)$/;

// Subtracts whole minutes from a fixed-offset ISODateTime, borrowing across the day
// boundary correctly. Used for notification offsets and the booking-createdAt edge clamp
// (docs/05-MOCK-DATA-STRATEGY.md sections 3.6 and 6.5), both of which only ever subtract
// from a known "-05:00" timestamp, so no timezone-aware parsing is needed.
export function subtractMinutesFromISODateTime(dateTime: ISODateTime, minutes: number): ISODateTime {
  const match = ISO_DATETIME_PATTERN.exec(dateTime);
  if (!match) {
    throw new Error(`subtractMinutesFromISODateTime: unexpected ISODateTime format "${dateTime}"`);
  }
  const [, datePart, hh, mm, ss, ms, offset] = match;
  const totalMinutes = Number(hh) * 60 + Number(mm) - minutes;
  const dayOffset = Math.floor(totalMinutes / 1440);
  const minutesOfDay = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minutesOfDay / 60);
  const minute = minutesOfDay % 60;
  const resultDate = dayOffset === 0 ? datePart : addDaysISO(datePart, dayOffset);
  return `${resultDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${ss}.${ms}${offset}`;
}
