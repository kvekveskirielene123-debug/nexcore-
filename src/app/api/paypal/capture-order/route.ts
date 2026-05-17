import { createClient } from "@/lib/supabase/server";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/paypal";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  brilliant_2wk: 14,
  brilliant_1mo: 31,
  brilliant_1yr: 365,
};

async function activateSubscription(
  userId: string,
  tier: string,
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
) {
  const days = PLAN_DAYS[tier] ?? 31;
  const now = new Date();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", userId)
    .maybeSingle();

  const currentExpiry = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : null;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const orderId = body?.orderId as string;
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  try {
    const token = await getPayPalToken();

    // Fetch order to verify ownership and get current status
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!orderRes.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = await orderRes.json();

    // Security: custom_id is set to "{userId}:{tier}" when we created the order
    const customId = (order.purchase_units?.[0]?.custom_id as string) ?? "";
    const [orderedUserId, tier] = customId.split(":");
    if (orderedUserId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status === "COMPLETED") {
      // Card Fields auto-captures — order already complete, just activate
      const expiresAt = await activateSubscription(user.id, tier, supabase);
      return NextResponse.json({ success: true, expiresAt });
    }

    if (order.status !== "APPROVED") {
      return NextResponse.json(
        { error: `Order status: ${order.status}` },
        { status: 400 }
      );
    }

    // Capture the PayPal Buttons order
    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!captureRes.ok) {
      const err = await captureRes.text();
      console.error("PayPal capture failed:", err);
      return NextResponse.json({ error: "Capture failed" }, { status: 502 });
    }

    const capture = await captureRes.json();
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Capture status: ${capture.status}` },
        { status: 400 }
      );
    }

    const expiresAt = await activateSubscription(user.id, tier, supabase);
    return NextResponse.json({ success: true, expiresAt });
  } catch (err: any) {
    console.error("capture-order exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
