// docs/04 / CLAUDE.md: src/domain/constants/formats.ts's DISPLAY_* formats are English-shaped
// and do not transfer ('MMM d, yyyy' renders "sept 17, 2026" in Spanish, where the natural form
// is "17 sept 2026"). ISO_DATE_FORMAT and ISO_TIME_FORMAT stay put in formats.ts - those are
// data formats the seed generator and selectors depend on, not display. This file holds only
// the per-locale *display* format strings; src/hooks/use-date-locale.ts is the only consumer.
import {
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATE_SHORT_FORMAT,
  DISPLAY_TIME_FORMAT,
  DISPLAY_WEEKDAY_SHORT_FORMAT,
} from '@/domain/constants';
import type { Locale } from './locales';

export interface LocaleDateFormats {
  displayDate: string; // '17 sept 2026' (es) / 'Sep 17, 2026' (en)
  displayDateShort: string; // '17 sept' (es) / 'Sep 17' (en)
  weekdayShort: string; // 'mié' (es) / 'Wed' (en)
  displayTime: string; // '18:00' (es, 24h) / '6:00 PM' (en, 12h)
}

export const LOCALE_DATE_FORMATS: Record<Locale, LocaleDateFormats> = {
  es: {
    displayDate: 'd MMM yyyy',
    displayDateShort: 'd MMM',
    weekdayShort: 'EEE',
    displayTime: 'HH:mm',
  },
  // English keeps formats.ts's existing DISPLAY_* strings verbatim - those constants stay in
  // place for phase-2 call sites that have not migrated yet, and this is the same shape.
  en: {
    displayDate: DISPLAY_DATE_FORMAT,
    displayDateShort: DISPLAY_DATE_SHORT_FORMAT,
    weekdayShort: DISPLAY_WEEKDAY_SHORT_FORMAT,
    displayTime: DISPLAY_TIME_FORMAT,
  },
};
