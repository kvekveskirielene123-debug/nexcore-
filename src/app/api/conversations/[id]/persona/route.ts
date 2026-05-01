import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/conversations/[id]/persona  body: { persona_id: string | null }
 * Sets (or clears) the active persona for this conversation.
 * Subsequent AI replies will use this persona's info in the system prompt.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: conversationId } = await params;

  try {
    const body = (await request.json()) as { persona_id: string | null };
    const newPersonaId = body.persona_id;

    if (newPersonaId !== null && typeof newPersonaId !== "string") {
      return NextResponse.json({ error: "Invalid persona_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership of the conversation
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || conv.user_id !== user.id) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // If a persona_id was given, verify it's the user's
    if (newPersonaId) {
      const { data: persona } = await supabase
        .from("personas")
        .select("id, user_id")
        .eq("id", newPersonaId)
        .maybeSingle();
      if (!persona || persona.user_id !== user.id) {
        return NextResponse.json({ error: "Persona not found" }, { status: 404 });
      }
    }

    const { error } = await supabase
      .from("conversations")
      .update({ persona_id: newPersonaId })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Conversation persona update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Conversation persona PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
