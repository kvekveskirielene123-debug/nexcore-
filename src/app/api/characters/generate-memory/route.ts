import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  return NextResponse.json({ content });
}
