// date-fns format strings, reused by src/lib/dates.ts and, later, by components/hooks
// that display a date or time. Keeping the literal format strings here (rather than
// inline at each date-fns call) means a display-format change never needs a source grep.

export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
export const ISO_TIME_FORMAT = 'HH:mm';

export const DISPLAY_DATE_FORMAT = 'MMM d, yyyy'; // 'Sep 17, 2026'
export const DISPLAY_DATE_SHORT_FORMAT = 'MMM d'; // 'Sep 17'
export const DISPLAY_WEEKDAY_SHORT_FORMAT = 'EEE'; // 'Mon'
export const DISPLAY_TIME_FORMAT = 'h:mm a'; // '6:00 AM'
