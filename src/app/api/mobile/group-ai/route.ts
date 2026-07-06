import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/buildSystemPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import { deductMarks, refundMarks } from "@/lib/marks/balance";
import { isSubscriptionActive, MODELS } from "@/lib/ai/modelConfig";

// AI character participation in group chats.
// Called by the mobile client when a user @mentions a character in a group.
// Returns the character's reply — client inserts it as a group_message.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Group AI always uses Haiku — fast, cheap, good for group banter
const GROUP_AI_MODEL = MODELS.haiku;
// Hard cap regardless of what client sends — prevents large-context abuse
const MAX_HISTORY_LIMIT = 20;

type RequestBody = {
  groupId: string;
  characterId: string;
  userId: string;
  triggerMessage: string;
  historyLimit?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { groupId, characterId, userId, triggerMessage } = body;
    // Cap historyLimit server-side — client cannot force a large context window
    const historyLimit = Math.min(Math.max(1, Number(body.historyLimit) || 20), MAX_HISTORY_LIMIT);

    if (!groupId || !characterId || !userId || !triggerMessage?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Auth: verify userId exists and load subscription for mark cost
    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_expires_at")
      .eq("id", userId)
      .single();
    if (!profileCheck) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit per user per group
    if (!checkRateLimit(`group-ai:${userId}:${groupId}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }

    // Run all validation BEFORE touching marks — nothing is charged if any check fails.

    // Verify user is a member of this group
    const { data: membership } = await supabaseAdmin
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();
    if (!membership) return NextResponse.json({ error: "Not a group member" }, { status: 403 });

    // Verify character is a bot in this group
    const { data: groupData } = await supabaseAdmin
      .from("group_conversations")
      .select("bot_character_ids, name")
      .eq("id", groupId)
      .single();
    const botIds: string[] = Array.isArray(groupData?.bot_character_ids) ? groupData.bot_character_ids : [];
    if (!botIds.includes(characterId)) {
      return NextResponse.json({ error: "Character not in group" }, { status: 403 });
    }

    // Load character
    const { data: character } = await supabaseAdmin
      .from("characters")
      .select("id, name, subtitle, description, long_term_memory, gender_pronouns, greeting")
      .eq("id", characterId)
      .single();
    if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    // All checks passed — now charge the user who triggered the @mention.
    // The group leader is NOT charged; only the person who actually sends the message pays.
    const isSub = isSubscriptionActive((profileCheck as any).subscription_expires_at ?? null);
    const cost = isSub ? GROUP_AI_MODEL.costSubscriber : GROUP_AI_MODEL.costStandard;
    let marksDebited = false;
    if (cost > 0) {
      try {
        await deductMarks(userId, cost, "group_ai_haiku", groupId, supabaseAdmin);
        marksDebited = true;
      } catch (err: any) {
        if (err.message?.includes("insufficient_marks")) {
          return NextResponse.json({ error: "insufficient_marks", required: cost }, { status: 402 });
        }
        throw err;
      }
    }

    // Load recent group messages as context
    const { data: recentMsgs } = await supabaseAdmin
      .from("group_messages")
      .select("sender_id, content, character_id, character_name")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(historyLimit);

    // Build conversation history for Claude
    // Map group messages → assistant/user turns from the character's perspective
    const history = (recentMsgs ?? []).reverse().map((m): Anthropic.MessageParam => {
      const isBot = m.character_id === characterId;
      const content = m.content?.trim() || " ";
      return {
        role: isBot ? "assistant" : "user",
        content: isBot ? content : `[${m.character_name ?? "member"}]: ${content}`,
      };
    });

    // Deduplicate consecutive same-role messages
    const deduped: Anthropic.MessageParam[] = [];
    for (const m of history) {
      if (deduped.length > 0 && deduped[deduped.length - 1].role === m.role) {
        deduped[deduped.length - 1] = m;
      } else {
        deduped.push(m);
      }
    }
    // Ensure starts with user
    while (deduped.length > 0 && deduped[0].role !== "user") deduped.shift();
    // Ensure ends with user (the trigger message)
    if (deduped.length === 0 || deduped[deduped.length - 1].role !== "user") {
      deduped.push({ role: "user", content: triggerMessage });
    } else {
      deduped[deduped.length - 1] = { role: "user", content: deduped[deduped.length - 1].content as string };
    }

    const systemPrompt = buildSystemPrompt({ character, userProfile: null, pinnedMemory: null });
    const groupContext = `\n\nYou are participating in a group chat called "${groupData?.name ?? "the group"}". Multiple people are in this conversation. Respond naturally to whoever @mentioned you. Keep your reply concise — 1-3 sentences unless the conversation calls for more.`;

    let reply = "";
    try {
      const response = await anthropic.messages.create({
        model: GROUP_AI_MODEL.anthropicId,
        max_tokens: 400,
        system: systemPrompt + groupContext,
        messages: deduped,
      });
      reply = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("").trim();
    } catch (err: any) {
      if (marksDebited) await refundMarks(userId, cost, groupId, supabaseAdmin).catch(() => {});
      console.error("[group-ai] anthropic error:", err);
      return NextResponse.json({ error: "AI error" }, { status: 500 });
    }

    if (!reply) {
      if (marksDebited) await refundMarks(userId, cost, groupId, supabaseAdmin).catch(() => {});
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("[group-ai] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
