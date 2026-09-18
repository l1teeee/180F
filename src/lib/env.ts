// Supabase env detection (ADR-010, docs/02-ARCHITECTURE.md section 7). Both variables must
// be set for Supabase Auth to activate; missing values are the default demo path, not an
// error, so nothing here logs a warning - that would look broken in front of a client.

export interface Env {
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  isSupabaseConfigured: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const env: Env = {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
