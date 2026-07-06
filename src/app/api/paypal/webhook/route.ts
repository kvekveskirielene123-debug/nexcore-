import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/paypal";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  brilliant_2wk: 14,
  brilliant_1mo: 31,
  brilliant_1yr: 365,
};

async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not set — rejecting webhook to prevent unsigned requests");
    return false;
  }

  let token: string;
  try {
    token = await getPayPalToken();
  } catch {
    return false;
  }

  const res = await fetch(
    `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    }
  );

  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const valid = await verifyWebhookSignature(request.headers, rawBody).catch(() => false);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const customId = (event.resource?.custom_id as string) ?? "";
    const parts = customId.split(":");
    const userId = parts[0];
    const tier   = parts[1];

    // Skip marks pack purchases — those are fulfilled by capture-order, not here
    if (!userId || !tier || tier === "marks" || !PLAN_DAYS[tier]) {
      return NextResponse.json({ ok: true });
    }

    // Idempotency: use the PayPal event ID as a unique key so retried webhooks
    // don't extend the subscription a second time
    const eventId = (event.id as string) ?? "";
    const { error: dedupError } = await supabaseAdmin.from("mark_transactions").insert({
      user_id:            userId,
      amount:             0,
      reason:             "subscription_payment_event",
      payment_session_id: eventId,
    });
    if (dedupError) {
      // Unique constraint violation means this event was already processed
      if (dedupError.message?.includes("unique") || dedupError.message?.includes("duplicate") || dedupError.code === "23505") {
        return NextResponse.json({ ok: true });
      }
      // Unexpected error — let PayPal retry
      return NextResponse.json({ error: "dedup check failed" }, { status: 500 });
    }

    const days = PLAN_DAYS[tier];
    const now = new Date();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", userId)
      .maybeSingle();

    const currentExpiry = profile?.subscription_expires_at
      ? new Date(profile.subscription_expires_at)
      : null;

    const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await supabaseAdmin
      .from("profiles")
      .update({ subscription_expires_at: newExpiry.toISOString() })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true });
}
