import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";
import { deductMarks } from "@/lib/marks/balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const DAILY_FREE_STANDARD = 10;
const DAILY_FREE_SUBSCRIBER = 40;
const INSPO_MARKS_COST = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { conversationId, userId, chargeMarks } = body ?? {};

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Missing conversationId or userId" }, { status: 400 });
    }

    // Verify userId
    const { data: profileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (!profileCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load conversation — verify it belongs to user
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, character_id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Load character
    const { data: character } = await supabaseAdmin
      .from("characters")
      .select("id, name, subtitle, description")
      .eq("id", conversation.character_id)
      .single();

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Deduct marks if caller says we're over the free limit
    if (chargeMarks) {
      try {
        await deductMarks(userId, INSPO_MARKS_COST, "inspiration_used", conversationId, supabaseAdmin);
      } catch (err: any) {
        if (err.message?.includes("insufficient_marks")) {
          return NextResponse.json(
            { error: "insufficient_marks", required: INSPO_MARKS_COST },
            { status: 402 }
          );
        }
        throw err;
      }
    }

    // Load recent conversation history (last 12 messages)
    const { data: history } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(12);

    const recentMessages = (history ?? []).reverse();

    // Build context string from history
    const contextLines = recentMessages
      .map(m => `${m.role === "user" ? "User" : character.name}: ${m.content}`)
      .join("\n");

    const systemPrompt = `You are a creative writing assistant for an AI roleplay app. The user is roleplaying with an AI character named "${character.name}".

Your task: generate exactly 3 distinct, immersive suggestions for what the USER could say or do next in this conversation. Each suggestion should be a roleplay message written from the user's perspective.

Make the 3 options feel genuinely different:
- One could be emotionally vulnerable or tender
- One could be bold, assertive, or provocative
- One could take the story in an unexpected or playful direction

Rules:
- Write each suggestion as if the user is speaking/acting (first-person or action roleplay style with *asterisks*)
- Keep each suggestion to 1-3 sentences max
- Do NOT include numbering, labels, or explanation — just the suggestion text itself
- Respond ONLY with a valid JSON array of exactly 3 strings: ["...", "...", "..."]
- No markdown, no preamble, no trailing text — ONLY the JSON array`;

    const userPrompt = `Here is the recent conversation:\n\n${contextLines || "(no messages yet — suggest an opening)"}\n\nGenerate 3 inspiration suggestions for what the user could say or do next.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    // Parse JSON — be tolerant of Claude wrapping in ```json blocks
    let suggestions: string[] = [];
    try {
      const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        suggestions = parsed.slice(0, 3).map(String);
      }
    } catch {
      // Fallback: split by newlines if parsing fails
      suggestions = raw.split("\n").filter(l => l.trim().length > 0).slice(0, 3);
    }

    if (suggestions.length === 0) {
      return NextResponse.json({ error: "Could not generate suggestions" }, { status: 500 });
    }

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("[mobile/inspiration] error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
