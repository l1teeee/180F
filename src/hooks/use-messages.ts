'use client';

// Call sites read properties directly (`const m = useMessages(); m.dashboard.title`) - no
// string key paths, no `t('a.b.c')` - so every access is autocompleted and a typo is a compile
// error (Messages is derived from the Spanish dictionary, src/i18n/messages.ts).
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
import { useLocaleStore } from '@/stores/locale.store';

const DICTIONARIES: Record<Locale, Messages> = { es, en };

export function useMessages(): Messages {
  const locale = useLocaleStore((state) => state.locale);
  return DICTIONARIES[locale];
}
