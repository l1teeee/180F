// Provider selection (ADR-010, docs/02-ARCHITECTURE.md section 7). The dynamic import is
// what actually keeps @supabase/supabase-js lazy: a static top-level import of
// supabase-auth-provider.ts here would pull the SDK into every bundle that reaches this
// module, Demo Auth included.
import { env } from '@/lib/env';
import type { AuthProvider } from './auth-provider';
import { DemoAuthProvider } from './demo-auth-provider';

export async function createAuthProvider(): Promise<AuthProvider> {
  if (env.isSupabaseConfigured) {
    const { SupabaseAuthProvider } = await import('./supabase-auth-provider');
    return new SupabaseAuthProvider();
  }
  return new DemoAuthProvider();
}
