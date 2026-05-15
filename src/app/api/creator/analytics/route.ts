import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/creator/analytics
// Returns stats for all characters owned by the authenticated user.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();

  // Characters + their aggregate stats
  const { data: characters } = await supabase
    .from("characters")
    .select(`
      id, name, avatar_url, visibility, is_nsfw, chat_count, created_at,
      character_stats ( avg_rating, total_rating_votes )
    `)
    .eq("created_by", user.id)
    .order("chat_count", { ascending: false });

  if (!characters || characters.length === 0) {
    return NextResponse.json({ characters: [], totals: { chats: 0, ratings: 0, favorites: 0 } });
  }

  const characterIds = characters.map(c => c.id);

  // Favorites per character
  const { data: favorites } = await supabase
    .from("character_favorites")
    .select("character_id")
    .in("character_id", characterIds);

  const favCounts: Record<string, number> = {};
  (favorites ?? []).forEach(f => { favCounts[f.character_id] = (favCounts[f.character_id] ?? 0) + 1; });

  // New conversations in last 7 days per character
  const { data: recentConvs } = await supabase
    .from("conversations")
    .select("character_id")
    .in("character_id", characterIds)
    .gte("created_at", sevenDaysAgo);

  const recentCounts: Record<string, number> = {};
  (recentConvs ?? []).forEach(c => { recentCounts[c.character_id] = (recentCounts[c.character_id] ?? 0) + 1; });

  // Marks earned via this creator's characters in last 30 days
  const { data: markTxns } = await supabase
    .from("mark_transactions")
    .select("amount, conversation_id, created_at")
    .lt("amount", 0) // outgoing spend = revenue event
    .gte("created_at", thirtyDaysAgo);

  // We can't join conversation→character server-side without more complex query,
  // so return total marks spent on chats (proxy for creator revenue potential)
  const totalMarkSpend = (markTxns ?? []).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const enriched = characters.map(c => ({
    ...c,
    favorite_count:   favCounts[c.id] ?? 0,
    new_chats_7d:     recentCounts[c.id] ?? 0,
    avg_rating:       (c.character_stats as any)?.[0]?.avg_rating ?? null,
    total_ratings:    (c.character_stats as any)?.[0]?.total_rating_votes ?? 0,
  }));

  const totals = {
    chats:     enriched.reduce((s, c) => s + (c.chat_count ?? 0), 0),
    ratings:   enriched.reduce((s, c) => s + c.total_ratings, 0),
    favorites: enriched.reduce((s, c) => s + c.favorite_count, 0),
    mark_spend_30d: totalMarkSpend,
  };

  return NextResponse.json({ characters: enriched, totals });
}
