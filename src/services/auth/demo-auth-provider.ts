// Demo Auth (ADR-010): the fallback provider, active whenever Supabase env vars are absent -
// the normal case for this demo. Session persisted in localStorage so a page refresh does not
// bounce an already-signed-in demo user back to /login.
import type { AuthProvider, AuthUser } from './auth-provider';

const DEMO_EMAIL = 'admin@demo.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_USER: AuthUser = { id: 'demo-admin', email: DEMO_EMAIL, name: 'Studio Admin' };
const SESSION_STORAGE_KEY = '180f.demo.session';

// Only one identity ever exists in Demo Auth, so a stored session is trusted only as an
// "is this our session" boolean - the returned user always comes from the DEMO_USER
// constant, never from parsed storage fields (a shape check, not a value we trust).
function readStoredSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const hasDemoEmail =
      parsed !== null && typeof parsed === 'object' && (parsed as { email?: unknown }).email === DEMO_EMAIL;
    return hasDemoEmail ? DEMO_USER : null;
  } catch {
    return null;
  }
}

function writeStoredSession(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export class DemoAuthProvider implements AuthProvider {
  async getSession(): Promise<AuthUser | null> {
    return readStoredSession();
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error('Invalid email or password.');
    }
    writeStoredSession(DEMO_USER);
    return DEMO_USER;
  }

  async signOut(): Promise<void> {
    writeStoredSession(null);
  }
}
