// Date/time helpers for the seed generator (src/data/**) and the selector layer
// (src/domain/selectors/**). Every ISODate here is a bare 'YYYY-MM-DD' wall-clock string -
// date-fns' parseISO treats a date-only string as local time (not UTC, unlike `new Date()`),
// so parse -> add/sub -> format round-trips stay on the same calendar day regardless of the
// host machine's timezone. That is the "no timezone conversion" rule from
// docs/04-DOMAIN-MODEL.md section 7 invariant 6, satisfied without a timezone library.
import {
  addDays,
  differenceInCalendarDays,
  format,
  getDate,
  getDay,
  isSameMonth,
  parse,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import type { ISODate, ISODateTime, TimeOfDay } from '@/domain/types';
import {
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATE_SHORT_FORMAT,
  DISPLAY_TIME_FORMAT,
  DISPLAY_WEEKDAY_SHORT_FORMAT,
  ISO_DATE_FORMAT,
} from '@/domain/constants';

// A fixed, argument-ful reference date used only to anchor 'HH:mm' parsing/formatting -
// the calendar day is discarded, so any fixed date works.
const TIME_OF_DAY_REFERENCE = new Date(2000, 0, 1);

export function addDaysISO(date: ISODate, amount: number): ISODate {
  return format(addDays(parseISO(date), amount), ISO_DATE_FORMAT);
}

export function subDaysISO(date: ISODate, amount: number): ISODate {
  return format(subDays(parseISO(date), amount), ISO_DATE_FORMAT);
}

export function startOfMonthISO(date: ISODate): ISODate {
  return format(startOfMonth(parseISO(date)), ISO_DATE_FORMAT);
}

export function subMonthsISO(date: ISODate, months: number): ISODate {
  return format(subMonths(parseISO(date), months), ISO_DATE_FORMAT);
}

// Calendar days from `from` to `to` (positive when `to` is later).
export function daysBetweenISO(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

export function getDayOfMonth(date: ISODate): number {
  return getDate(parseISO(date));
}

// 0 = Sunday .. 6 = Saturday, matching date-fns getDay().
export function getWeekdayIndex(date: ISODate): number {
  return getDay(parseISO(date));
}

export function isWeekendISO(date: ISODate): boolean {
  const day = getWeekdayIndex(date);
  return day === 0 || day === 6;
}

export function isSameISOMonth(a: ISODate, b: ISODate): boolean {
  return isSameMonth(parseISO(a), parseISO(b));
}

// `n` ISO dates ending at `date` inclusive, ascending chronological order.
export function lastNISODates(date: ISODate, n: number): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(date, i - (n - 1)));
}

export function formatDisplayDate(date: ISODate): string {
  return format(parseISO(date), DISPLAY_DATE_FORMAT);
}

export function formatDisplayDateShort(date: ISODate): string {
  return format(parseISO(date), DISPLAY_DATE_SHORT_FORMAT);
}

export function formatWeekdayShort(date: ISODate): string {
  return format(parseISO(date), DISPLAY_WEEKDAY_SHORT_FORMAT);
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
