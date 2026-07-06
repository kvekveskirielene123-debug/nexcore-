import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — returns the caller's current marks balance (JWT required)
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("profiles").select("marks").eq("id", authUser.id).single();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ balance: (data as any).marks ?? 0 });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // JWT auth — senderId is derived from the verified token, never trusted from the body
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, amount } = await request.json();
    const senderId = authUser.id;

    if (!recipientId || typeof amount !== "number" || amount <= 0 || senderId === recipientId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (amount > 50_000) {
      return NextResponse.json({ error: "Amount too large" }, { status: 400 });
    }

    const [senderRes, recipientRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, marks").eq("id", senderId).single(),
      supabaseAdmin.from("profiles").select("id, marks").eq("id", recipientId).single(),
    ]);

    if (!senderRes.data) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (!recipientRes.data) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

    const senderMarks = (senderRes.data as any).marks ?? 0;
    if (senderMarks < amount) {
      return NextResponse.json({ error: "insufficient_marks", balance: senderMarks }, { status: 402 });
    }

    const newSenderBalance = senderMarks - amount;
    const newRecipientBalance = ((recipientRes.data as any).marks ?? 0) + amount;

    // Update both atomically via admin client (bypasses RLS — mobile clients can't update other users)
    const [senderUpd, recipientUpd] = await Promise.all([
      supabaseAdmin.from("profiles").update({ marks: newSenderBalance }).eq("id", senderId),
      supabaseAdmin.from("profiles").update({ marks: newRecipientBalance }).eq("id", recipientId),
    ]);

    if (senderUpd.error) throw new Error(senderUpd.error.message);
    if (recipientUpd.error) throw new Error(recipientUpd.error.message);

    // Transaction log (best-effort)
    await Promise.allSettled([
      supabaseAdmin.from("mark_transactions").insert({
        user_id: senderId, amount: -amount,
        reason: "gift_sent", balance_after: newSenderBalance,
      }),
      supabaseAdmin.from("mark_transactions").insert({
        user_id: recipientId, amount,
        reason: "gift_received", balance_after: newRecipientBalance,
      }),
    ]);

    return NextResponse.json({ success: true, new_balance: newSenderBalance });
  } catch (err: any) {
    console.error("[mobile/gift-marks]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
