'use client';

// Mounted once at the app root (components/layout/providers.tsx), not per-component, so the
// persisted language preference is read exactly once regardless of how many screens are open.
// Modeled on app-sidebar.tsx's sidebarCollapsed read/write effects (docs/03-DESIGN-SYSTEM.md
// section 14.4): the store's initial value (DEFAULT_LOCALE) is what both the server render and
// the first client render use, so there is nothing for React to reconcile and no hydration
// warning (CLAUDE.md architecture invariant 6).
import { useEffect, useRef, type ReactNode } from 'react';
import { LOCALE_STORAGE_KEY, toLocale, useLocaleStore } from '@/stores/locale.store';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    try {
      setLocale(toLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY)));
    } catch {
      // Storage can throw (private browsing, disabled site data) - the app just keeps the
      // default locale instead of failing to render.
    }
  }, [setLocale]);

  // Cross-tab sync: a language change in another tab is reflected here without a reload.
  // Registered here (not at locale.store.ts module scope) so it has an actual lifecycle - this
  // provider mounts once at the app root, so one mount is still one listener per tab, but a
  // module-scope registration would re-run and stack up listeners on every dev HMR reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function handleStorage(event: StorageEvent) {
      if (event.key !== LOCALE_STORAGE_KEY || event.newValue === null) return;
      setLocale(toLocale(event.newValue));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [setLocale]);

  // Guards the very first commit's write effect below: without it, the write effect would fire
  // on mount using the pre-hydration DEFAULT_LOCALE and immediately overwrite whatever the read
  // effect above just found in storage, before that update has re-rendered.
  const skipNextWrite = useRef(true);
  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Persistence is a nicety, not a requirement to function.
    }
  }, [locale]);

  return <>{children}</>;
}
