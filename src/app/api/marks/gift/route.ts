import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const GIFT_AMOUNTS = [5, 10, 25, 50, 100];
const MAX_GIFT_PER_DAY = 500;

// POST /api/marks/gift
// body: { toUserId: string, amount: number }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId, amount } = await request.json();

  if (!toUserId || toUserId === user.id) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }
  if (!GIFT_AMOUNTS.includes(amount)) {
    return NextResponse.json({ error: "Invalid gift amount" }, { status: 400 });
  }

  // Verify recipient exists
  const { data: recipient } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", toUserId)
    .maybeSingle();
  if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  // Daily gift cap check
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const { data: todayGifts } = await supabase
    .from("mark_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("reason", "gift_sent")
    .gte("created_at", dayStart.toISOString());

  const totalGiftedToday = (todayGifts ?? []).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  if (totalGiftedToday + amount > MAX_GIFT_PER_DAY) {
    return NextResponse.json({
      error: `Daily gift limit reached (${MAX_GIFT_PER_DAY} ⟡ / day)`,
    }, { status: 429 });
  }

  // Deduct from sender
  const { data: deductResult, error: deductErr } = await supabase.rpc("deduct_marks", {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: "gift_sent",
    p_conversation_id: null,
  });
  if (deductErr) {
    const msg = deductErr.message?.includes("insufficient") ? "Not enough marks" : "Could not send gift";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Credit recipient
  await supabase.rpc("credit_marks", {
    p_user_id: toUserId,
    p_amount: amount,
    p_reason: "gift_received",
    p_payment_session_id: null,
  });

  return NextResponse.json({
    success: true,
    new_balance: deductResult as number,
    recipient_username: recipient.username,
    amount,
  });
}
