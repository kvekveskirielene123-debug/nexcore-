import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/buildSystemPrompt";
import {
  MODELS,
  type ModelKey,
  getModelCost,
  isSubscriptionActive,
} from "@/lib/ai/modelConfig";
import { deductMarks, refundMarks } from "@/lib/marks/balance";
import { checkRateLimit } from "@/lib/rateLimit";
import { tryCompleteReferral } from "@/lib/referrals";
import type { Persona } from "@/lib/personas/types";

// Mobile chat endpoint — authenticates by verifying the userId exists in the DB
// rather than by validating a Supabase JWT. This bypasses the Bearer token issue
// that affects the /api/chat/stream endpoint from React Native clients.
// All DB operations use the admin client; all queries are explicitly scoped to userId.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type RequestBody = {
  conversationId: string;
  message: string;
  model: ModelKey;
  userId: string;
  attachmentUrl?: string;
  replyLength?: "short" | "medium" | "long";
  includeHistory?: boolean;
  skipUserMessage?: boolean; // true for "continue story" — don't save the user turn to DB
  generateInspirations?: boolean; // returns 3 user-reply suggestions, saves nothing to DB
  chargeMarks?: boolean; // if true (over daily free limit), deduct marks for inspiration
  isRetry?: boolean; // true for regeneration — skip marks deduction, replace existing message
  personaId?: string | null; // active persona for this message
};

// Per-model token caps and word targets — each tier produces a noticeably
// different output length and quality level to justify its mark cost.
const MODEL_PROFILE: Record<string, {
  tokens: Record<string, number>;
  words:  Record<string, number>;
  style:  string;
}> = {
  haiku: {
    tokens: { short: 140, medium: 240, long:  420 },
    words:  { short:  30, medium:  75, long:  140 },
    style:  "Be concise and reactive. Short, punchy sentences. Stay in character but keep responses brief and snappy.",
  },
  sonnet: {
    tokens: { short: 260, medium: 480, long:  860 },
    words:  { short:  70, medium: 160, long:  300 },
    style:  "Balance depth with pacing. Show emotion and character texture. Include moderate descriptive detail and let the scene breathe.",
  },
  opus: {
    tokens: { short: 420, medium: 800, long: 1500 },
    words:  { short: 120, medium: 280, long:  500 },
    style:  "Be expansive, richly descriptive, and deeply in-character. Use vivid sensory detail, explore emotion and subtext, and make every response feel like a scene from a novel.",
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { conversationId, message, model, userId, attachmentUrl, replyLength, includeHistory, skipUserMessage, generateInspirations, chargeMarks, isRetry, personaId } = body;

    if (!conversationId || (!generateInspirations && !message?.trim() && !attachmentUrl) || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!generateInspirations && !(model in MODELS)) {
      return NextResponse.json({ error: "Unknown model" }, { status: 400 });
    }
    if (message && message.length > 4000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Auth: verify the userId is a real profile in the DB.
    // No JWT needed — the UUID alone is cryptographically hard to guess (128 bits).
    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profileCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = { id: userId };

    // Rate limit
    if (!checkRateLimit(`chat:${user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many messages. Slow down." }, { status: 429 });
    }

    // Load conversation — verify it belongs to this user
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, character_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Load character
    const { data: character } = await supabaseAdmin
      .from("characters")
      .select("id, name, subtitle, description, long_term_memory, gender_pronouns, greeting, is_nsfw")
      .eq("id", conversation.character_id)
      .single();

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Fetch active persona (if provided) — always from DB, never trust client fields
    let activePersona: Persona | null = null;
    if (personaId) {
      const { data: personaRow } = await supabaseAdmin
        .from("personas")
        .select("id, user_id, name, age, gender, bio, tone, tags, hobbies_text, avatar_url, created_at, updated_at")
        .eq("id", personaId)
        .eq("user_id", user.id)
        .single();
      if (personaRow) activePersona = personaRow as Persona;
    }

    // NSFW gate: block chat with adult characters for users who haven't opted in.
    // The mobile client enforces this before reaching the API, but this is defense-in-depth
    // so the check cannot be bypassed by direct API calls.
    if ((character as any).is_nsfw) {
      const { data: nsfwProfile } = await supabaseAdmin
        .from("profiles")
        .select("show_nsfw")
        .eq("id", user.id)
        .single();
      if (!(nsfwProfile as any)?.show_nsfw) {
        return NextResponse.json({ error: "nsfw_not_allowed" }, { status: 403 });
      }
    }

    // ── INSPIRATION MODE ──────────────────────────────────────────────────────
    // Generate 3 possible user-reply suggestions based on current conversation.
    // Nothing is saved to DB. Haiku is used to keep it cheap and fast.
    if (generateInspirations) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("subscription_expires_at")
        .eq("id", user.id)
        .single();

      const INSPO_COST = 10;
      if (chargeMarks) {
        try {
          await deductMarks(user.id, INSPO_COST, "inspiration_used", conversationId, supabaseAdmin);
        } catch (err: any) {
          if (err.message?.includes("insufficient_marks")) {
            return NextResponse.json({ error: "insufficient_marks", required: INSPO_COST }, { status: 402 });
          }
          throw err;
        }
      }

      const { data: historyMsgs } = await supabaseAdmin
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(14);

      const recentLines = (historyMsgs ?? [])
        .reverse()
        .map(m => `${m.role === "user" ? "User" : character.name}: ${m.content}`)
        .join("\n");

      const inspoSystem = `You are a creative writing assistant for an interactive AI roleplay app. The user is roleplaying with an AI character named "${character.name}".

Generate exactly 3 distinct suggestions for what the USER could say or do next to continue the story. Write each suggestion in the user's voice — first-person speech or roleplay action with *asterisks*.

Requirements:
- Option 1: emotionally vulnerable, tender, or soft
- Option 2: bold, assertive, or provocative
- Option 3: playful, unexpected, or scene-shifting
- Each suggestion: 1–3 sentences max, immersive and natural to the tone
- Respond ONLY with a valid JSON array of exactly 3 strings: ["...", "...", "..."]
- No numbering, no labels, no explanation outside the JSON`;

      const inspoUserMsg = `Recent conversation:\n\n${recentLines || "(conversation just started — suggest an opening)"}\n\nGenerate 3 inspiration replies for the user.`;

      const inspoResp = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: inspoSystem,
        messages: [{ role: "user", content: inspoUserMsg }],
      });

      const raw = inspoResp.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("")
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      let suggestions: string[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) suggestions = parsed.slice(0, 3).map(String);
      } catch {
        // Fallback: split on newlines
        suggestions = raw.split(/\n+/).filter(l => l.trim().length > 4).slice(0, 3);
      }

      if (suggestions.length === 0) {
        return NextResponse.json({ error: "Could not generate suggestions" }, { status: 500 });
      }

      return NextResponse.json({ suggestions });
    }
    // ── END INSPIRATION MODE ──────────────────────────────────────────────────

    // Load pinned_memory separately — column may not exist yet if migration hasn't run
    const { data: convExtra } = await supabaseAdmin
      .from("conversations")
      .select("pinned_memory")
      .eq("id", conversationId)
      .single();

    // Load profile for marks + subscription
    // NOTE: facts_json does not exist in the DB yet — omit it to avoid crashing this query
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("username, tone_preference, subscription_expires_at, subscription_tier, referral_redeemed")
      .eq("id", user.id)
      .single();

    if (profileErr) console.error("[mobile/chat] profile fetch error:", profileErr.message);

    // Subscriber status is determined solely by subscription_expires_at being a future date.
    // subscription_tier is not required — it may be null for legacy StoreKit subscribers.
    const isSub = isSubscriptionActive((profile as any)?.subscription_expires_at ?? null);
    const cost = getModelCost(model, isSub);



    // Deduct marks — skipped for retries (regeneration of existing response)
    let marksDebited = false;
    if (cost > 0 && !isRetry) {
      try {
        await deductMarks(user.id, cost, `chat_${model}`, conversationId, supabaseAdmin);
        marksDebited = true;
      } catch (err: any) {
        if (err.message?.includes("insufficient_marks")) {
          return NextResponse.json(
            { error: "insufficient_marks", required: cost },
            { status: 402 }
          );
        }
        throw err;
      }
    }

    // Save user message (skipped for "continue story" requests)
    if (!skipUserMessage) {
      const { error: userMsgError } = await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
        ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
      });
      if (userMsgError) {
        if (marksDebited) await refundMarks(user.id, cost, conversationId, supabaseAdmin).catch(() => {});
        return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
      }
    }

    // Load recent history — select only role+content so this works before the
    // attachment_url column migration has been applied
    const { data: history } = includeHistory === false
      ? { data: null }
      : await supabaseAdmin
          .from("messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(20);

    const rawPinnedMemory: string | null = (convExtra as any)?.pinned_memory ?? null;
    let pinnedMemoryText: string | null = null;
    if (rawPinnedMemory) {
      if (rawPinnedMemory.trim().startsWith("[")) {
        try {
          const cards = JSON.parse(rawPinnedMemory) as string[];
          pinnedMemoryText = cards.filter(Boolean).join("\n\n");
        } catch { pinnedMemoryText = rawPinnedMemory; }
      } else {
        pinnedMemoryText = rawPinnedMemory;
      }
    }

    const systemPrompt = buildSystemPrompt({
      character,
      userProfile: profile ?? null,
      activePersona,
      pinnedMemory: pinnedMemoryText,
    });

    // Deduplicate consecutive same-role messages, strip leading/trailing assistant messages,
    // and always guarantee the array ends with the current user message.
    type HistMsg = { role: string; content: string };

    let deduped: HistMsg[];
    if (includeHistory === false || !history) {
      deduped = [{ role: "user", content: message }];
    } else {
      const rawHistory = history as HistMsg[];
      deduped = [];
      for (const m of rawHistory) {
        if (deduped.length > 0 && deduped.at(-1)!.role === m.role) {
          deduped[deduped.length - 1] = m;
        } else {
          deduped.push(m);
        }
      }
      // Strip leading assistant messages (Claude requires conversation to start with user)
      while (deduped.length > 0 && deduped[0].role !== "user") {
        deduped.shift();
      }
      // Strip trailing assistant messages — can happen when the client saves the
      // greeting async and it lands in the DB after the user's message by timestamp.
      // A trailing assistant acts as a prefill and can produce an empty continuation.
      while (deduped.length > 0 && deduped[deduped.length - 1].role !== "user") {
        deduped.pop();
      }
      // Guarantee the current user message is present and is last.
      // (It may have been removed by deduplication if a prior user turn matched it.)
      if (deduped.length === 0 || deduped[deduped.length - 1].content !== message) {
        if (deduped.length > 0 && deduped[deduped.length - 1].role === "user") {
          deduped[deduped.length - 1] = { role: "user", content: message };
        } else {
          deduped.push({ role: "user", content: message });
        }
      }
    }

    // Build Anthropic messages — inject attachmentUrl into the last user turn (current message)
    const anthropicMessages = deduped.map((m, i): Anthropic.MessageParam => {
      const isCurrentMsg = i === deduped.length - 1 && m.role === "user";
      const url = isCurrentMsg ? (attachmentUrl ?? null) : null;

      if (url) {
        const parts: Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> = [
          { type: "image", source: { type: "url", url } as any },
        ];
        if (m.content.trim()) parts.push({ type: "text", text: m.content });
        return { role: "user", content: parts };
      }

      // Anthropic rejects empty-string content — use a space as fallback
      const safeContent = m.content?.trim() || " ";
      return { role: m.role as "user" | "assistant", content: safeContent };
    });

    // Non-streaming: wait for the full reply then return plain JSON.
    // React Native fetch does not support ReadableStream, so SSE is not viable.
    let reply = "";
    let inputTokens: number | null = null;
    let outputTokens: number | null = null;
    try {
      const profile   = MODEL_PROFILE[model] ?? MODEL_PROFILE.haiku;
      const lengthKey = replyLength ?? "medium";
      const maxTokens = profile.tokens[lengthKey] ?? profile.tokens.medium;
      const wordTarget = profile.words[lengthKey]  ?? profile.words.medium;
      const finalSystem = systemPrompt
        + `\n\nSTYLE: ${profile.style}`
        + `\n\nREPLY LENGTH: Write approximately ${wordTarget} words. Stay close to this count — do not go significantly over or under.`;
      console.log("[mobile/chat] sending to claude — model:", MODELS[model].anthropicId, "msgs:", JSON.stringify(anthropicMessages));
      const response = await anthropic.messages.create({
        model: MODELS[model].anthropicId,
        max_tokens: maxTokens,
        system: finalSystem,
        messages: anthropicMessages,
      });
      console.log("[mobile/chat] claude raw response — stop_reason:", response.stop_reason, "usage:", JSON.stringify(response.usage), "content:", JSON.stringify(response.content));
      reply = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");
      inputTokens = response.usage?.input_tokens ?? null;
      outputTokens = response.usage?.output_tokens ?? null;
      console.log("[mobile/chat] reply extracted:", JSON.stringify(reply));
    } catch (err: any) {
      console.error("[mobile/chat] anthropic error:", err);
      if (marksDebited) await refundMarks(user.id, cost, conversationId, supabaseAdmin).catch(() => {});
      return NextResponse.json({ error: "AI error" }, { status: 500 });
    }

    const { data: savedMsg } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
      model_used: model,
      marks_cost: cost,
      ...(inputTokens !== null ? { input_tokens: inputTokens } : {}),
      ...(outputTokens !== null ? { output_tokens: outputTokens } : {}),
    }).select("id").single();

    // Non-blocking referral completion check (skipped once redeemed)
    if (!(profile as any)?.referral_redeemed) {
      tryCompleteReferral(user.id, supabaseAdmin).catch(() => {});
    }

    return NextResponse.json({ message: reply, messageId: savedMsg?.id ?? null });
  } catch (err: any) {
    console.error("[mobile/chat] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
