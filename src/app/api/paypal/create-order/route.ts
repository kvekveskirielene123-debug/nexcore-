import { createClient } from "@/lib/supabase/server";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/paypal";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const PLAN_AMOUNTS: Record<string, { amount: string; days: number; desc: string }> = {
  brilliant_2wk: { amount: "4.99", days: 14, desc: "Nexcor Brilliant — 2 Weeks" },
  brilliant_1mo: { amount: "9.99", days: 31, desc: "Nexcor Brilliant — 1 Month" },
  brilliant_1yr: { amount: "59.99", days: 365, desc: "Nexcor Brilliant — 1 Year" },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`paypal-create:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json();
  const tier = body?.tier as string;
  const plan = PLAN_AMOUNTS[tier];
  if (!plan) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  try {
    const token = await getPayPalToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${user.id}-${tier}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: plan.amount },
            description: plan.desc,
            custom_id: `${user.id}:${tier}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("PayPal create-order failed:", err);
      return NextResponse.json({ error: "PayPal error" }, { status: 502 });
    }

    const order = await res.json();
    return NextResponse.json({ id: order.id as string });
  } catch (err: any) {
    console.error("create-order exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
