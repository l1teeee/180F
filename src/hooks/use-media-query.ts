'use client';

import { useCallback, useSyncExternalStore } from 'react';

// The server cannot evaluate a media query, so `serverValue` is what the server-rendered HTML
// and React's hydration pass assume. React re-renders with the real value right after
// hydration, without a mismatch warning.
export function useMediaQuery(query: string, serverValue: boolean): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
