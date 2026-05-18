import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/chat/archive
// Archives a conversation (saves user title) and creates a fresh one.
// Body: { conversationId?: string, title: string, characterId: string }
// Response: { newConversationId: string, titleSaved: boolean }
export async function POST(request: Request) {
  const body = (await request.json()) as {
    conversationId?: string | null;
    title?: string;
    characterId?: string;
  };

  const { conversationId, title, characterId } = body;

  console.log("[archive] received:", { conversationId: conversationId?.slice(0, 8), title: title?.slice(0, 20), characterId: characterId?.slice(0, 8) });

  if (!characterId) {
    return NextResponse.json({ error: "Missing characterId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[archive] unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Save the user's title on the old conversation.
  //    Use the same query pattern as the working auto-title endpoint:
  //    filter by user_id + title_auto_generated = true (matches RLS policy).
  let titleSaved = false;
  if (conversationId && title?.trim()) {
    const safeTitle = title.trim().slice(0, 80);

    // Include title_auto_generated: true in the payload so the RLS WITH CHECK
    // constraint (which requires title_auto_generated = true after update) is satisfied.
    const { data: updated, error: updateError } = await supabase
      .from("conversations")
      .update({ title: safeTitle, title_auto_generated: true })
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .select("id");

    titleSaved = !updateError && (updated?.length ?? 0) > 0;
    console.log("[archive] title update:", { safeTitle, rows: updated?.length ?? 0, error: updateError?.message ?? null });
  } else {
    console.log("[archive] skipping title update — conversationId:", conversationId, "title:", title);
  }

  // 2. Create a fresh conversation for the same character
  const { data: newConv, error: insertError } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      character_id: characterId,
      title: "New Chat",
      title_auto_generated: true,
    })
    .select("id")
    .single();

  console.log("[archive] new conv:", { id: newConv?.id?.slice(0, 8), error: insertError?.message ?? null });

  if (insertError || !newConv) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create conversation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ newConversationId: newConv.id, titleSaved });
}
