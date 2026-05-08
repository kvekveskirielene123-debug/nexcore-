import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const FREE_LIMIT      = 15;
const BRILLIANT_LIMIT = 50;

function isoWeek(): string {
  const d = new Date();
  const thu = new Date(d);
  thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3); // nearest Thursday
  const jan4 = new Date(thu.getFullYear(), 0, 4);
  const week = Math.round((thu.getTime() - jan4.getTime()) / 604800000) + 1;
  return `${thu.getFullYear()}-W${week.toString().padStart(2, "0")}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("subscription_expires_at, memory_gen_count, memory_gen_week")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile)
    return NextResponse.json({ error: "Profile not found." }, { status: 400 });

  const brilliant = isSubscriptionActive(profile.subscription_expires_at ?? null);
  const limit     = brilliant ? BRILLIANT_LIMIT : FREE_LIMIT;
  const week      = isoWeek();

  // Reset counter if it's a new week
  const currentCount = profile.memory_gen_week === week ? (profile.memory_gen_count ?? 0) : 0;

  if (currentCount >= limit) {
    return NextResponse.json(
      {
        error: `Weekly AI Generate limit reached (${limit}/${limit}). ${
          brilliant
            ? "Resets next Monday."
            : "Upgrade to Brilliant for 50/week, or wait until Monday."
        }`,
        limitReached: true,
        limit,
        brilliant,
      },
      { status: 429 }
    );
  }

  const { name, subtitle, description, category } = await request.json();
  if (!name?.trim())
    return NextResponse.json({ error: "Character name required." }, { status: 400 });

  const prompt = `You are helping someone build an AI roleplay character named "${name}"${subtitle ? ` — "${subtitle}"` : ""}${description ? `.\n\nCharacter description: ${description}` : ""}.

Write 3–5 concise, vivid bullet points for the "${category}" section of this character's memory. Each bullet should be one clear sentence. Be specific, not generic. Use {{char}} to refer to the character and {{user}} for the person talking to them where natural. Do NOT include section headers, just the bullets. Total response must stay under 400 characters.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const content = (message.content[0] as Anthropic.TextBlock).text?.trim() ?? "";

  // Increment counter (fire-and-forget — don't block the response)
  supabase
    .from("profiles")
    .update({ memory_gen_count: currentCount + 1, memory_gen_week: week })
    .eq("id", user.id)
    .then(() => {});

  return NextResponse.json({
    content,
    used: currentCount + 1,
    limit,
    brilliant,
  });
}
