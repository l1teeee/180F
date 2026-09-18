// Supabase Auth (ADR-010). @supabase/supabase-js is imported at this module's top level
// only - create-auth-provider.ts reaches this file exclusively through a dynamic import(), so
// the SDK never enters a bundle that only ever uses Demo Auth.
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { AuthProvider, AuthUser } from './auth-provider';

function toAuthUser(user: User): AuthUser {
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined;
  return {
    id: user.id,
    email: user.email ?? '',
    name: metadataName ?? user.email ?? 'Studio Admin',
  };
}

export class SupabaseAuthProvider implements AuthProvider {
  private readonly client: SupabaseClient;

  constructor() {
    // createAuthProvider() only ever constructs this class when env.isSupabaseConfigured is
    // true, so both values being present is a contract this constructor may assume, not a
    // user-facing scenario it needs to explain.
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new Error('SupabaseAuthProvider requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    this.client = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  async getSession(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error || !data.session) return null;
    return toAuthUser(data.session.user);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message ?? 'Invalid email or password.');
    }
    return toAuthUser(data.user);
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}
