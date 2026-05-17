import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client that uses the service role key.
 * Bypasses RLS — NEVER import this in client-side code or expose it to the browser.
 * Only for auth.admin.* calls (deleteUser, getUserById, etc.).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
