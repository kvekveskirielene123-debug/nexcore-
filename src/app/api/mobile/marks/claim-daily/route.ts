import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MARKS_DAILY_BONUS = 50;
const MARKS_DAILY_BONUS_SUBSCRIBER = 100;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, marks, last_daily_bonus_at, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    if (profile.last_daily_bonus_at) {
      const diffH = (now.getTime() - new Date(profile.last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
      if (diffH < 24) {
        const next = new Date(new Date(profile.last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000);
        return NextResponse.json({ claimed: false, next_available_at: next.toISOString() });
      }
    }

    const isSub = isSubscriptionActive(profile.subscription_expires_at ?? null);
    const amount = isSub ? MARKS_DAILY_BONUS_SUBSCRIBER : MARKS_DAILY_BONUS;

    const newBalance = (profile.marks ?? 0) + amount;

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ marks: newBalance, last_daily_bonus_at: now.toISOString() })
      .eq("id", userId);

    if (updateErr) throw new Error(updateErr.message);

    await supabaseAdmin.from("mark_transactions").insert({
      user_id: userId,
      amount,
      reason: "daily_bonus",
      balance_after: newBalance,
    });

    return NextResponse.json({ claimed: true, amount, new_balance: newBalance });
  } catch (err: any) {
    console.error("[mobile/marks/claim-daily]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("marks, last_daily_bonus_at")
    .eq("id", userId)
    .single();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let available = true;
  let next_available_at: string | null = null;
  if (profile.last_daily_bonus_at) {
    const diffH = (Date.now() - new Date(profile.last_daily_bonus_at).getTime()) / (1000 * 60 * 60);
    if (diffH < 24) {
      available = false;
      next_available_at = new Date(new Date(profile.last_daily_bonus_at).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return NextResponse.json({ available, next_available_at, current_balance: profile.marks });
}
