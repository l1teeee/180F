// Finding 2 (timezone-dependent seed): every function here converts between an ISODate string
// and calendar-day arithmetic. Each is asserted both for its literal calendar behaviour and,
// for the ones the generator actually walks a multi-day window with, for producing the same
// result under every one of the five timezones docs/05-MOCK-DATA-STRATEGY.md's contract names.
import { afterEach, describe, expect, it } from 'vitest';
import {
  addDaysISO,
  addMinutesToTimeOfDay,
  buildISODateTime,
  daysBetweenISO,
  formatDisplayDate,
  formatDisplayDateShort,
  formatDisplayTime,
  formatWeekdayShort,
  getDayOfMonth,
  getWeekdayIndex,
  isSameISOMonth,
  isWeekendISO,
  lastNISODates,
  startOfMonthISO,
  subDaysISO,
  subMonthsISO,
  subtractMinutesFromISODateTime,
} from './dates';

const TIMEZONES = ['UTC', 'America/Bogota', 'Pacific/Apia', 'Pacific/Kiritimati', 'Asia/Kolkata'];

// Runs `fn` once per zone in TIMEZONES, restores process.env.TZ afterward, and returns the
// per-zone results so the caller can assert they all agree.
function acrossTimezones<T>(fn: () => T): { tz: string; value: T }[] {
  const original = process.env.TZ;
  try {
    return TIMEZONES.map((tz) => {
      process.env.TZ = tz;
      return { tz, value: fn() };
    });
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}

describe('addDaysISO / subDaysISO', () => {
  it('adds within a month', () => {
    expect(addDaysISO('2026-09-17', 3)).toBe('2026-09-20');
  });

  it('crosses a month boundary', () => {
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('crosses a year boundary', () => {
    expect(addDaysISO('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('respects a non-leap February', () => {
    expect(addDaysISO('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('respects a leap February', () => {
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDaysISO('2028-02-29', 1)).toBe('2028-03-01');
  });

  it('subDaysISO is the inverse of addDaysISO', () => {
    expect(subDaysISO('2026-09-20', 3)).toBe('2026-09-17');
    expect(subDaysISO('2026-02-01', 1)).toBe('2026-01-31');
  });

  it('a zero amount is a no-op', () => {
    expect(addDaysISO('2026-09-17', 0)).toBe('2026-09-17');
  });

  it('is identical across all five timezones', () => {
    const results = acrossTimezones(() => addDaysISO('2026-12-30', 5));
    expect(new Set(results.map((r) => r.value)).size).toBe(1);
    expect(results[0].value).toBe('2027-01-04');
  });
});

describe('startOfMonthISO', () => {
  it('returns day 1 of the same month', () => {
    expect(startOfMonthISO('2026-09-17')).toBe('2026-09-01');
  });

  it('is a no-op when already the first of the month', () => {
    expect(startOfMonthISO('2026-01-01')).toBe('2026-01-01');
  });

  it('is identical across all five timezones', () => {
    const results = acrossTimezones(() => startOfMonthISO('2026-09-17'));
    expect(new Set(results.map((r) => r.value)).size).toBe(1);
  });
});

describe('subMonthsISO', () => {
  it('subtracts within the same year', () => {
    expect(subMonthsISO('2026-09-17', 1)).toBe('2026-08-17');
  });

  it('crosses a year boundary', () => {
    expect(subMonthsISO('2026-01-15', 1)).toBe('2025-12-15');
  });

  it('clamps to the last day of a shorter target month instead of overflowing', () => {
    // Mar 31 minus 1 month -> Feb 2026 has 28 days (2026 is not a leap year).
    expect(subMonthsISO('2026-03-31', 1)).toBe('2026-02-28');
  });

  it('clamps against a leap February correctly', () => {
    expect(subMonthsISO('2028-03-31', 1)).toBe('2028-02-29');
  });

  it('walks back the 36-month customer join history window (docs/05 section 4)', () => {
    expect(subMonthsISO('2026-09-01', 36)).toBe('2023-09-01');
  });

  it('is identical across all five timezones, including the clamp case', () => {
    const plain = acrossTimezones(() => subMonthsISO('2026-09-17', 1));
    expect(new Set(plain.map((r) => r.value)).size).toBe(1);

    const clamped = acrossTimezones(() => subMonthsISO('2026-03-31', 1));
    expect(new Set(clamped.map((r) => r.value)).size).toBe(1);
    expect(clamped[0].value).toBe('2026-02-28');
  });
});

describe('daysBetweenISO', () => {
  it('is 0 for the same date', () => {
    expect(daysBetweenISO('2026-09-17', '2026-09-17')).toBe(0);
  });

  it('is positive when `to` is later', () => {
    expect(daysBetweenISO('2026-09-17', '2026-09-20')).toBe(3);
  });

  it('is negative when `to` is earlier', () => {
    expect(daysBetweenISO('2026-09-20', '2026-09-17')).toBe(-3);
  });

  it('crosses a year boundary', () => {
    expect(daysBetweenISO('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('is identical across all five timezones', () => {
    const results = acrossTimezones(() => daysBetweenISO('2026-01-01', '2026-12-31'));
    expect(new Set(results.map((r) => r.value)).size).toBe(1);
    expect(results[0].value).toBe(364);
  });
});

describe('getDayOfMonth', () => {
  it('extracts the day-of-month integer', () => {
    expect(getDayOfMonth('2026-09-05')).toBe(5);
    expect(getDayOfMonth('2026-09-17')).toBe(17);
  });
});

describe('getWeekdayIndex / isWeekendISO', () => {
  // 2026-09-13 (Sun) .. 2026-09-19 (Sat), date-fns getDay() convention: 0 = Sunday .. 6 = Saturday.
  const WEEK = [
    ['2026-09-13', 0, true],
    ['2026-09-14', 1, false],
    ['2026-09-15', 2, false],
    ['2026-09-16', 3, false],
    ['2026-09-17', 4, false],
    ['2026-09-18', 5, false],
    ['2026-09-19', 6, true],
  ] as const;

  it.each(WEEK)('%s -> weekday index %i, isWeekend=%s', (date, expectedIndex, expectedWeekend) => {
    expect(getWeekdayIndex(date)).toBe(expectedIndex);
    expect(isWeekendISO(date)).toBe(expectedWeekend);
  });

  it('weekday index is identical across all five timezones for a full week', () => {
    for (const [date, expectedIndex] of WEEK) {
      const results = acrossTimezones(() => getWeekdayIndex(date));
      expect(new Set(results.map((r) => r.value)).size).toBe(1);
      expect(results[0].value).toBe(expectedIndex);
    }
  });
});

describe('isSameISOMonth', () => {
  it('is true within the same month and year', () => {
    expect(isSameISOMonth('2026-09-01', '2026-09-30')).toBe(true);
  });

  it('is false across different months', () => {
    expect(isSameISOMonth('2026-09-30', '2026-10-01')).toBe(false);
  });

  it('is false across different years, same month/day', () => {
    expect(isSameISOMonth('2026-09-17', '2027-09-17')).toBe(false);
  });
});

describe('lastNISODates', () => {
  it('returns n dates ending at `date` inclusive, ascending', () => {
    expect(lastNISODates('2026-09-17', 7)).toEqual([
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
    ]);
  });
});

describe('buildISODateTime', () => {
  it('combines date + time into the fixed -05:00 offset shape', () => {
    expect(buildISODateTime('2026-09-17', '09:00')).toBe('2026-09-17T09:00:00.000-05:00');
  });
});

describe('subtractMinutesFromISODateTime', () => {
  it('subtracts within the same day', () => {
    expect(subtractMinutesFromISODateTime('2026-09-17T09:00:00.000-05:00', 30)).toBe(
      '2026-09-17T08:30:00.000-05:00',
    );
  });

  it('borrows across the day boundary', () => {
    expect(subtractMinutesFromISODateTime('2026-09-17T00:10:00.000-05:00', 20)).toBe(
      '2026-09-16T23:50:00.000-05:00',
    );
  });

  it('throws on an unexpected format', () => {
    expect(() => subtractMinutesFromISODateTime('not-a-date', 5)).toThrow();
  });
});

describe('addMinutesToTimeOfDay', () => {
  it('adds within the day', () => {
    expect(addMinutesToTimeOfDay('06:00', 90)).toBe('07:30');
  });

  it('wraps past midnight', () => {
    expect(addMinutesToTimeOfDay('23:30', 45)).toBe('00:15');
  });
});

describe('formatDisplay* helpers', () => {
  afterEach(() => {
    delete process.env.TZ;
  });

  it('formatDisplayDate / formatDisplayDateShort / formatWeekdayShort', () => {
    expect(formatDisplayDate('2026-09-17')).toBe('Sep 17, 2026');
    expect(formatDisplayDateShort('2026-09-17')).toBe('Sep 17');
    expect(formatWeekdayShort('2026-09-17')).toBe('Thu');
  });

  it('formatDisplayTime', () => {
    expect(formatDisplayTime('06:00')).toBe('6:00 AM');
    expect(formatDisplayTime('13:30')).toBe('1:30 PM');
  });

  it('formatDisplayDate reads the same calendar day under every timezone (symmetric local pair)', () => {
    const results = acrossTimezones(() => formatDisplayDate('2026-09-17'));
    expect(new Set(results.map((r) => r.value)).size).toBe(1);
    expect(results[0].value).toBe('Sep 17, 2026');
  });
});
