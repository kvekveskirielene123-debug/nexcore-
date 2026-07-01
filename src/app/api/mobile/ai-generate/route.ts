import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

// Lightweight AI text generation endpoint for in-app tooling (e.g. memory card generator).
// JWT-authenticated — userId is derived from the verified token, not the request body.
// No conversation, no marks deduction, no history. Haiku only for cost control.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MAX_PROMPT_LENGTH = 2000;
const MAX_SYSTEM_LENGTH = 1000;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const { prompt, system } = body as { prompt?: string; system?: string };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
    }

    if (!checkRateLimit(`ai-generate:${userId}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }

    // Server-side weekly generation limit — cannot be bypassed by clearing AsyncStorage
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_expires_at, subscription_tier")
      .eq("id", userId)
      .single();
    const isSub = isSubscriptionActive((profile as any)?.subscription_expires_at ?? null);
    const weeklyLimit = isSub ? 50 : 15;
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    if (!checkRateLimit(`ai-generate-weekly:${userId}`, weeklyLimit, ONE_WEEK_MS)) {
      return NextResponse.json({ error: "weekly_limit_reached", limit: weeklyLimit, isSub }, { status: 429 });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      ...(system?.trim() ? { system: system.trim().slice(0, MAX_SYSTEM_LENGTH) } : {}),
      messages: [{ role: "user", content: prompt.trim() }],
    });

    const message = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    if (!message) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error("[mobile/ai-generate]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
