// Phase 1 of Spanish/English support (CLAUDE.md, docs/13-DECISIONS.md). Spanish is the
// default locale, English the alternative - the language control lives in Settings only
// (no top bar or rail switcher).
export type Locale = 'es' | 'en';

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALES: readonly Locale[] = ['es', 'en'];

// Each language names itself in its own language (the standard convention for a language
// picker), so a lost English speaker can still find "English" even while the UI reads Spanish.
export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};
