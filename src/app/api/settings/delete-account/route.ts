import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * DELETE /api/settings/delete-account  body: { confirm_username: string }
 *
 * Permanently deletes the current user's account.
 *
 * Cascade behavior:
 *  - profiles → cascades to characters they own (RLS+FK), conversations, messages,
 *    favorites, ratings, mark transactions
 *  - conversations users had with the deleted user's PUBLIC characters are preserved
 *    via ON DELETE SET NULL (migration v4.1) — those chats become "character deleted"
 *  - auth.users row is deleted last
 *
 * Server-side gating:
 *  - User must be authenticated
 *  - body.confirm_username must match their current username (extra safety net
 *    on top of the client confirmation dialog)
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const confirmUsername = (body?.confirm_username ?? "").trim();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the username they typed matches their actual username
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.username || profile.username !== confirmUsername) {
      return NextResponse.json(
        { error: "Confirmation does not match your username." },
        { status: 400 }
      );
    }

    // Delete the auth.users row. Supabase ON DELETE CASCADE on profiles.id
    // (referencing auth.users.id) will cascade to profiles, which then
    // cascades through every other RLS-protected table per migration v3.
    //
    // NOTE: this requires the service role to delete auth users.
    // We use Supabase's admin endpoint via the supabase-js client. If your
    // server client is only the anon key, this will fail — see README for
    // the fix (use SUPABASE_SERVICE_ROLE_KEY in a server-only admin client).
    const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authDeleteErr) {
      // Fallback: delete the profile row directly (auth row will be orphaned but
      // the user data is gone). Better than failing entirely.
      console.error(
        "auth.admin.deleteUser failed (using profile-only fallback):",
        authDeleteErr
      );
      const { error: profileDeleteErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
      if (profileDeleteErr) {
        return NextResponse.json(
          { error: profileDeleteErr.message },
          { status: 500 }
        );
      }
    }

    // Sign out the now-deleted user
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
