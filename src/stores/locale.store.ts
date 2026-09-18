// Per-viewer UI preference, NOT demo data (CLAUDE.md, docs/13-DECISIONS.md): this never touches
// StudioSettings or useSettingsStore, so "Reset demo data" (ADR-022) cannot throw the language
// back to Spanish mid-demo. Modeled on useUiStore.sidebarCollapsed (docs/03-DESIGN-SYSTEM.md
// section 14.4): the store's initial value is DEFAULT_LOCALE, which is what both the server
// render and the first client render use, so there is nothing for React to reconcile - the
// persisted value is read from localStorage only in an effect after mount
// (components/layout/locale-provider.tsx), never during render (CLAUDE.md architecture
// invariant 6). Cross-tab sync (the `storage` event, same pattern ADR-022 uses for demo data -
// see stores/demo-persistence.ts / demo-runtime.store.ts) is registered by LocaleProvider's own
// effect, not at module scope: module evaluation is a singleton only in production, but under
// dev HMR this module re-evaluates on every hot reload, so a module-scope listener would stack
// up duplicates. The provider mounts once at the app root, so registering there in an effect
// with a cleanup keeps the same "one listener per tab" behaviour with an actual lifecycle.
import { create } from 'zustand';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';

export const LOCALE_STORAGE_KEY = '180f.ui.locale';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => set({ locale }),
}));

/** Validates an untrusted stored (or cross-tab) value against LOCALES; anything else falls back to DEFAULT_LOCALE. */
export function toLocale(value: string | null): Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value) ? (value as Locale) : DEFAULT_LOCALE;
}
