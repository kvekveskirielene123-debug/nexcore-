import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/mobile/character-stats
// Returns { chatCounts: { [characterId]: number } } for all characters.
// Uses service role to bypass RLS on conversations table.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("character_id");

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of (data ?? [])) {
      const cid = row.character_id as string;
      if (cid) counts[cid] = (counts[cid] ?? 0) + 1;
    }

    return NextResponse.json({ chatCounts: counts });
  } catch (err: any) {
    console.error("[character-stats] error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
