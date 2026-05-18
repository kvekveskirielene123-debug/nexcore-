import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/chat/archive
// Archives a conversation (sets its title) and creates a fresh one.
// Body: { conversationId?: string, title: string, characterId: string }
// Response: { newConversationId: string, titleSaved: boolean }
export async function POST(request: Request) {
  const body = (await request.json()) as {
    conversationId?: string;
    title?: string;
    characterId?: string;
  };

  const { conversationId, title, characterId } = body;

  console.log("[archive] received:", { conversationId, title: title?.slice(0, 20), characterId: characterId?.slice(0, 8) });

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

  console.log("[archive] userId:", user.id.slice(0, 8));

  // 1. Save the user's title on the old conversation.
  //    Filter only by id (RLS enforces ownership). Don't touch title_auto_generated
  //    in case a constraint rejects it.
  let titleSaved = false;
  if (conversationId && title?.trim()) {
    const safeTitle = title.trim().slice(0, 80);
    const { data: updated, error: updateError } = await supabase
      .from("conversations")
      .update({ title: safeTitle })
      .eq("id", conversationId)
      .select("id");

    titleSaved = !updateError && (updated?.length ?? 0) > 0;
    console.log("[archive] title update:", { safeTitle, updated: updated?.length ?? 0, error: updateError?.message });
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

  console.log("[archive] new conv:", { id: newConv?.id?.slice(0, 8), error: insertError?.message });

  if (insertError || !newConv) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create conversation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ newConversationId: newConv.id, titleSaved });
}
