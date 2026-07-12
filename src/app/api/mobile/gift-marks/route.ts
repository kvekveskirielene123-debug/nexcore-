import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { deductMarks, creditMarks } from "@/lib/marks/balance";
import { isUserBanned } from "@/lib/checkBanned";
import { checkRateLimit } from "@/lib/rateLimit";
import { pushToUser } from "@/lib/pushNotify";

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

    if (await isUserBanned(authUser.id, supabaseAdmin)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (!checkRateLimit(`gift:${authUser.id}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many transfers. Slow down." }, { status: 429 });
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

    // Atomic deduction — RPC uses marks = marks - cost inside Postgres.
    // Throws "insufficient_marks" if a concurrent operation drained the balance between the check above and now.
    let newSenderBalance: number;
    try {
      newSenderBalance = await deductMarks(senderId, amount, "gift_sent", undefined, supabaseAdmin);
    } catch (err: any) {
      if (err.message?.includes("insufficient_marks")) {
        return NextResponse.json({ error: "insufficient_marks", balance: senderMarks }, { status: 402 });
      }
      throw err;
    }

    // Atomic credit — RPC uses marks = marks + amount inside Postgres,
    // so concurrent incoming gifts to the same recipient cannot overwrite each other.
    await creditMarks(recipientId, amount, "gift_received", undefined, supabaseAdmin);

    // Tag both transactions with each other's user_id so the activity list can show "from/to @user".
    // Update by time window (last 10s) to avoid needing a separate SELECT first.
    const since = new Date(Date.now() - 10_000).toISOString();
    const [tagSender, tagRecipient] = await Promise.all([
      supabaseAdmin.from("mark_transactions")
        .update({ counterpart_id: recipientId })
        .eq("user_id", senderId).eq("reason", "gift_sent")
        .gte("created_at", since),
      supabaseAdmin.from("mark_transactions")
        .update({ counterpart_id: senderId })
        .eq("user_id", recipientId).eq("reason", "gift_received")
        .gte("created_at", since),
    ]);
    if (tagSender.error) console.error("[gift-marks] tag sender failed:", tagSender.error.message);
    if (tagRecipient.error) console.error("[gift-marks] tag recipient failed:", tagRecipient.error.message);

    // Look up sender username for the notification (best-effort)
    const { data: senderProfile } = await supabaseAdmin
      .from("profiles").select("username").eq("id", senderId).single();
    const senderName = (senderProfile as any)?.username ?? "";

    pushToUser(supabaseAdmin, recipientId, "gift_marks", {
      senderName,
      amount: amount.toLocaleString(),
    }, { screen: "Profile" });

    return NextResponse.json({ success: true, new_balance: newSenderBalance });
  } catch (err: any) {
    console.error("[mobile/gift-marks]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
