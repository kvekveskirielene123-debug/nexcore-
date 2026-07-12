import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/buildSystemPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import { deductMarks, refundMarks } from "@/lib/marks/balance";
import { isSubscriptionActive, MODELS } from "@/lib/ai/modelConfig";

// Enhanced AI character participation for long-form roleplay / D&D campaigns.
// Uses Sonnet, 50-message context, 1500-token replies, and injects owner-written campaign notes.
// Called instead of /api/mobile/group-ai when campaign_mode is enabled on the group.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CAMPAIGN_MODEL = MODELS.sonnet;
// Flat cost regardless of subscription — campaign is a premium per-call feature.
// ~$0.030 per call (7 k tokens in + 600 tokens out avg at Sonnet rates).
// At $0.004/mark (large pack), 20 marks = $0.080 revenue → ~2.7× margin.
const CAMPAIGN_COST = 20;
const MAX_HISTORY = 50;
const MAX_TOKENS_REPLY = 1500;
// Stricter rate limit — Sonnet calls are heavier
const RATE_LIMIT_CALLS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RequestBody = {
  groupId: string;
  characterId: string;
  userId: string;
  triggerMessage: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { groupId, characterId, userId, triggerMessage } = body;

    if (!groupId || !characterId || !userId || !triggerMessage?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Auth: verify JWT
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (authUser.id !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Load subscription (needed for mark deduction only — cost is flat regardless)
    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", userId)
      .single();
    if (!profileCheck) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit per user per group (stricter than regular group-ai)
    if (!checkRateLimit(`group-campaign:${userId}:${groupId}`, RATE_LIMIT_CALLS, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }

    // Verify group membership
    const { data: membership } = await supabaseAdmin
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();
    if (!membership) return NextResponse.json({ error: "Not a group member" }, { status: 403 });

    // Load group — verify campaign mode is on, character is in bots list, grab campaign notes
    const { data: groupData } = await supabaseAdmin
      .from("group_conversations")
      .select("bot_character_ids, name, campaign_mode, campaign_notes")
      .eq("id", groupId)
      .single();

    if (!(groupData as any)?.campaign_mode) {
      return NextResponse.json({ error: "Campaign mode is not enabled for this group" }, { status: 403 });
    }

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

    // All checks passed — charge the triggering user
    let marksDebited = false;
    try {
      await deductMarks(userId, CAMPAIGN_COST, "group_campaign_sonnet", groupId, supabaseAdmin);
      marksDebited = true;
    } catch (err: any) {
      if (err.message?.includes("insufficient_marks")) {
        return NextResponse.json({ error: "insufficient_marks", required: CAMPAIGN_COST }, { status: 402 });
      }
      throw err;
    }

    // Load last 50 group messages as campaign context
    const { data: recentMsgs } = await supabaseAdmin
      .from("group_messages")
      .select("sender_id, content, character_id, character_name")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY);

    // Build conversation history from character's perspective
    const history = (recentMsgs ?? []).reverse().map((m): Anthropic.MessageParam => {
      const isBot = m.character_id === characterId;
      const content = m.content?.trim() || " ";
      return {
        role: isBot ? "assistant" : "user",
        content: isBot ? content : `[${m.character_name ?? "member"}]: ${content}`,
      };
    });

    // Collapse consecutive same-role messages (Anthropic API requirement)
    const deduped: Anthropic.MessageParam[] = [];
    for (const m of history) {
      if (deduped.length > 0 && deduped[deduped.length - 1].role === m.role) {
        deduped[deduped.length - 1] = m;
      } else {
        deduped.push(m);
      }
    }
    while (deduped.length > 0 && deduped[0].role !== "user") deduped.shift();
    if (deduped.length === 0 || deduped[deduped.length - 1].role !== "user") {
      deduped.push({ role: "user", content: triggerMessage });
    } else {
      deduped[deduped.length - 1] = {
        role: "user",
        content: deduped[deduped.length - 1].content as string,
      };
    }

    const campaignNotes = (groupData as any)?.campaign_notes?.trim() ?? "";
    const basePrompt = buildSystemPrompt({ character, userProfile: null, pinnedMemory: null });

    const campaignContext = [
      `\n\nYou are participating in a group campaign called "${groupData?.name ?? "the group"}".`,
      "This is a long-form roleplay or tabletop campaign session. You are an active participant.",
      "Respond in character. Be descriptive, immersive, and narratively rich — you have room to breathe.",
      "Track and reference earlier events in the conversation when relevant.",
      campaignNotes
        ? `\n\n## Campaign Notes (set by the group owner)\n${campaignNotes}`
        : "",
    ].join(" ");

    let reply = "";
    try {
      const response = await anthropic.messages.create({
        model: CAMPAIGN_MODEL.anthropicId,
        max_tokens: MAX_TOKENS_REPLY,
        system: basePrompt + campaignContext,
        messages: deduped,
      });
      reply = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("").trim();
    } catch (err: any) {
      if (marksDebited) await refundMarks(userId, CAMPAIGN_COST, groupId, supabaseAdmin).catch(() => {});
      console.error("[group-campaign] anthropic error:", err);
      return NextResponse.json({ error: "AI error" }, { status: 500 });
    }

    if (!reply) {
      if (marksDebited) await refundMarks(userId, CAMPAIGN_COST, groupId, supabaseAdmin).catch(() => {});
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("[group-campaign] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
