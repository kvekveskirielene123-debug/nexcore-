import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if the user is currently banned (permanently or temporarily).
 * Pass supabaseAdmin so this check always has read access to profiles,
 * regardless of any RLS policies on the profiles table.
 */
export async function isUserBanned(
  userId: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("banned, banned_until")
    .eq("id", userId)
    .single();

  if (!data) return false;
  if (data.banned === true) return true;
  if (data.banned_until && new Date(data.banned_until) > new Date()) return true;
  return false;
}
