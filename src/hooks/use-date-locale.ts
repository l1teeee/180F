'use client';

// Locale-aware replacements for the display-only helpers src/lib/dates.ts exposes
// (formatDisplayDate, formatDisplayDateShort, formatWeekdayShort, formatDisplayTime), so a
// component can format a date in the active language without importing date-fns itself.
// lib/dates.ts's own exports (including toLocalDisplayDate, reused below) are otherwise
// untouched and stay locale-free - the seed generator and selectors depend on that file
// remaining pure of any UI/i18n concern (docs/02-ARCHITECTURE.md section 1: domain never
// imports UI/i18n). Exporting an existing pure Date-construction helper does not make that
// file locale-aware; only this hook picks a locale.
import { useMemo } from 'react';
import { format, parse, type Locale as DateFnsLocale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import type { ISODate, TimeOfDay } from '@/domain/types';
import { LOCALE_DATE_FORMATS, type LocaleDateFormats } from '@/i18n/date-formats';
import type { Locale } from '@/i18n/locales';
import { toLocalDisplayDate } from '@/lib/dates';
import { useLocaleStore } from '@/stores/locale.store';

const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = { es, en: enUS };

// A fixed, argument-ful reference date used only to anchor 'HH:mm' parsing - the calendar day is
// discarded, so any fixed date works. Mirrors lib/dates.ts's own TIME_OF_DAY_REFERENCE.
const TIME_OF_DAY_REFERENCE = new Date(2000, 0, 1);

export interface DateLocale {
  locale: DateFnsLocale;
  formats: LocaleDateFormats;
  formatDisplayDate: (date: ISODate) => string;
  formatDisplayDateShort: (date: ISODate) => string;
  formatWeekdayShort: (date: ISODate) => string;
  formatDisplayTime: (time: TimeOfDay) => string;
}

export function useDateLocale(): DateLocale {
  const activeLocale = useLocaleStore((state) => state.locale);

  return useMemo(() => {
    const locale = DATE_FNS_LOCALES[activeLocale];
    const formats = LOCALE_DATE_FORMATS[activeLocale];
    return {
      locale,
      formats,
      formatDisplayDate: (date) => format(toLocalDisplayDate(date), formats.displayDate, { locale }),
      formatDisplayDateShort: (date) => format(toLocalDisplayDate(date), formats.displayDateShort, { locale }),
      formatWeekdayShort: (date) => format(toLocalDisplayDate(date), formats.weekdayShort, { locale }),
      formatDisplayTime: (time) =>
        format(parse(time, 'HH:mm', TIME_OF_DAY_REFERENCE), formats.displayTime, { locale }),
    };
  }, [activeLocale]);
}
