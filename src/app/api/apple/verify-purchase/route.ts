import { createClient } from "@/lib/supabase/server";
import { creditMarks } from "@/lib/marks/balance";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Map Apple IAP product IDs to what we grant
const MARK_PRODUCTS: Record<string, number> = {
  "com.nexcor.app.marks.small":  500,
  "com.nexcor.app.marks.medium": 1200,
  "com.nexcor.app.marks.large":  3000,
};

const SUB_PRODUCTS: Record<string, number> = {
  "com.nexcor.app.sub.monthly":   31,
  "com.nexcor.app.sub.quarterly": 91,
  "com.nexcor.app.sub.yearly":   365,
};

async function verifyWithApple(receipt: string): Promise<{ status: number; latest_receipt_info?: any[] }> {
  const secret = process.env.APPLE_SHARED_SECRET;
  if (!secret) throw new Error("APPLE_SHARED_SECRET not configured");

  const body = JSON.stringify({ "receipt-data": receipt, password: secret, "exclude-old-transactions": true });

  // Always try production first; Apple says to try production first and fall back to sandbox on status 21007
  const prodRes = await fetch("https://buy.itunes.apple.com/verifyReceipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const prod = await prodRes.json();

  if (prod.status === 21007) {
    // Sandbox receipt — use sandbox endpoint
    const sbRes = await fetch("https://sandbox.itunes.apple.com/verifyReceipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return sbRes.json();
  }

  return prod;
}

async function activateSubscription(
  userId: string,
  days: number,
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
): Promise<string> {
  const now = new Date();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", userId)
    .maybeSingle();

  const currentExpiry = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  await supabase
    .from("profiles")
    .update({ subscription_expires_at: newExpiry.toISOString() })
    .eq("id", userId);

  return newExpiry.toISOString();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { productId, receipt, transactionId } = body ?? {};

  if (!productId || !receipt || !transactionId) {
    return NextResponse.json({ error: "Missing productId, receipt, or transactionId" }, { status: 400 });
  }

  // Idempotency: reject duplicate transaction IDs
  const { data: existing } = await supabase
    .from("mark_transactions")
    .select("id")
    .eq("payment_session_id", transactionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, message: "Already processed." });
  }

  try {
    const result = await verifyWithApple(receipt);

    // status 0 = valid; 21007 handled above
    if (result.status !== 0) {
      console.error("Apple verifyReceipt status:", result.status);
      return NextResponse.json({ error: `Apple receipt invalid (status ${result.status})` }, { status: 400 });
    }

    // Confirm the transaction we received is in Apple's verified list
    const txns = result.latest_receipt_info ?? [];
    const verified = txns.find((t: any) => t.transaction_id === transactionId || t.original_transaction_id === transactionId);
    if (!verified) {
      return NextResponse.json({ error: "Transaction not found in receipt" }, { status: 400 });
    }

    // Fulfill
    if (MARK_PRODUCTS[productId]) {
      const marks = MARK_PRODUCTS[productId];
      const reasonKey = productId.split(".").pop(); // small | medium | large
      await creditMarks(user.id, marks, `iap_marks_${reasonKey}`, transactionId);
      return NextResponse.json({ success: true, message: `${marks.toLocaleString()} ⟡ added to your balance.` });
    }

    if (SUB_PRODUCTS[productId]) {
      const days = SUB_PRODUCTS[productId];

      const SUB_BONUS: Record<string, number> = {
        "com.nexcor.app.sub.monthly":   1500,
        "com.nexcor.app.sub.quarterly": 5000,
        "com.nexcor.app.sub.yearly":    18000,
      };
      const SUB_LABEL: Record<string, string> = {
        "com.nexcor.app.sub.monthly":   "monthly",
        "com.nexcor.app.sub.quarterly": "quarterly",
        "com.nexcor.app.sub.yearly":    "yearly",
      };

      // Detect first-time subscribe vs renewal before activating
      const { data: existingSub } = await supabase
        .from("profiles")
        .select("subscription_expires_at")
        .eq("id", user.id)
        .maybeSingle();
      const isRenewal = !!(existingSub?.subscription_expires_at &&
        new Date(existingSub.subscription_expires_at) > new Date());

      const expiresAt = await activateSubscription(user.id, days, supabase);

      const bonus = SUB_BONUS[productId] ?? 0;
      const label = SUB_LABEL[productId] ?? "subscription";
      const reason = isRenewal
        ? `Renewal bonus — ${label} plan`
        : `Welcome bonus — ${label} plan`;

      // Credit bonus (creditMarks handles the profiles UPDATE + mark_transactions INSERT)
      await creditMarks(user.id, bonus, reason, transactionId);

      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("marks")
        .eq("id", user.id)
        .maybeSingle();

      const newMarks = (freshProfile as any)?.marks ?? 0;

      return NextResponse.json({
        success: true,
        message: "Subscription activated! ◈ BRILLIANT is now active.",
        expiresAt,
        bonusMarks: bonus,
        newMarks,
      });
    }

    return NextResponse.json({ error: "Unknown product ID" }, { status: 400 });
  } catch (err: any) {
    console.error("Apple verify-purchase error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
