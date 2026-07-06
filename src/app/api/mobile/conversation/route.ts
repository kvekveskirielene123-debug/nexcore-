import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/mobile/conversation
// Creates a new conversation for a user+character pair and optionally
// inserts the character's greeting message.
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json().catch(() => null);
    const { characterId } = body ?? {};

    if (!characterId) {
      return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
    }

    // Verify character exists
    const { data: character } = await supabaseAdmin
      .from("characters")
      .select("id, greeting")
      .eq("id", characterId)
      .single();

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Create new conversation
    const { data: conversation, error: convErr } = await supabaseAdmin
      .from("conversations")
      .insert({ user_id: userId, character_id: characterId, persona_id: null })
      .select("id")
      .single();

    if (convErr || !conversation?.id) {
      console.error("[mobile/conversation] insert error:", convErr);
      return NextResponse.json({ error: convErr?.message ?? "Failed to create conversation" }, { status: 500 });
    }

    // Insert greeting message if character has one
    if (character.greeting) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: character.greeting,
      });
    }

    return NextResponse.json({ conversationId: conversation.id, greeting: character.greeting ?? null });
  } catch (err: any) {
    console.error("[mobile/conversation] error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
