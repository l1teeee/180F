// AuthProvider interface (ADR-010). DemoAuthProvider and SupabaseAuthProvider both implement
// this; AuthContext (auth-context.tsx) is the only thing that talks to a provider directly.
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthProvider {
  // Resolves the restored session, or null when there isn't one - never rejects.
  getSession(): Promise<AuthUser | null>;
  // Rejects with a plain Error(message) on invalid credentials - both implementations
  // normalise their own SDK's error shape to this one contract.
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}
