'use client';

// React binding for the provider strategy (ADR-010). (admin)/layout.tsx (Phase 2D) reads
// `status` to show a full-page skeleton while a session restores and to redirect to /login
// when there isn't one - this file only resolves the provider and exposes its result.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthProvider, AuthUser } from './auth-provider';
import { createAuthProvider } from './create-auth-provider';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const resolvedProvider = await createAuthProvider();
      if (cancelled) return;
      setProvider(resolvedProvider);
      const session = await resolvedProvider.getSession();
      if (cancelled) return;
      setUser(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!provider) throw new Error('Auth is not ready yet.');
      const signedInUser = await provider.signIn(email, password);
      setUser(signedInUser);
      setStatus('authenticated');
    },
    [provider],
  );

  const signOut = useCallback(async () => {
    if (!provider) return;
    await provider.signOut();
    setUser(null);
    setStatus('unauthenticated');
  }, [provider]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider.');
  }
  return context;
}
