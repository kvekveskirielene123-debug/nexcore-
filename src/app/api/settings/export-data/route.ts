import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/settings/export-data
// Returns a JSON file containing all personal data for the authenticated user.
// Satisfies GDPR Art. 20 (right to data portability).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all tables in parallel
  const [
    profileRes,
    charactersRes,
    personasRes,
    conversationsRes,
    transactionsRes,
    favoritesRes,
    ratingsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, bio, avatar_url, marks, tone_preference, chat_theme, chat_font_size, default_model, chat_language, show_nsfw, subscription_expires_at, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("characters")
      .select("id, name, subtitle, description, greeting, long_term_memory, gender_pronouns, avatar_url, visibility, is_nsfw, tier, created_at, updated_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("personas")
      .select("id, name, age, gender_pronouns, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("conversations")
      .select("id, title, character_id, last_message_at, created_at, messages(id, role, content, created_at)")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false }),

    supabase
      .from("mark_transactions")
      .select("id, amount, reason, balance_after, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("favorites")
      .select("character_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("ratings")
      .select("character_id, rating, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    notice: "This file contains all personal data Nexcor holds about you. You may request deletion at any time via Settings → Delete Account or by contacting us.",
    account: {
      email: user.email,
      created_at: user.created_at,
      profile: profileRes.data ?? null,
    },
    characters: charactersRes.data ?? [],
    personas: personasRes.data ?? [],
    conversations: conversationsRes.data ?? [],
    mark_transactions: transactionsRes.data ?? [],
    favorites: favoritesRes.data ?? [],
    ratings: ratingsRes.data ?? [],
  };

  const filename = `nexcor-data-export-${new Date().toISOString().split("T")[0]}.json`;

  return new Response(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
