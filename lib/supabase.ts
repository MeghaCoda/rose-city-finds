import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Forwards the caller's own session (if any) so Postgres sees `authenticated`
// + their app_metadata, and RLS -- not application code -- decides what
// they're allowed to do. No session = stays `anon`, same as before.
export async function createSupabaseClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined,
  );
}
