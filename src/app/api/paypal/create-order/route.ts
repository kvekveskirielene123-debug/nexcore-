import { createClient } from "@/lib/supabase/server";
import { getPayPalToken, PAYPAL_BASE } from "@/lib/paypal";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SUBSCRIPTION_PLANS: Record<string, { amount: string; days: number; desc: string }> = {
  brilliant_2wk: { amount: "4.99",  days: 14,  desc: "Nexcor Brilliant — 2 Weeks" },
  brilliant_1mo: { amount: "9.99",  days: 31,  desc: "Nexcor Brilliant — 1 Month" },
  brilliant_1yr: { amount: "59.99", days: 365, desc: "Nexcor Brilliant — 1 Year" },
};

const MARK_PACKS: Record<string, { amount: string; marks: number; desc: string }> = {
  small:  { amount: "2.99",  marks: 500,  desc: "Nexcor — 500 Marks" },
  medium: { amount: "4.99",  marks: 1200, desc: "Nexcor — 1,200 Marks" },
  large:  { amount: "11.99", marks: 3000, desc: "Nexcor — 3,000 Marks" },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`paypal-create:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json();
  const type: "subscription" | "marks" = body?.type ?? "subscription";

  let amount: string;
  let desc: string;
  let customId: string;
  let requestId: string;

  if (type === "marks") {
    const packId = body?.packId as string;
    const pack = MARK_PACKS[packId];
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    amount    = pack.amount;
    desc      = pack.desc;
    customId  = `${user.id}:marks:${packId}`;
    requestId = `${user.id}-marks-${packId}-${Date.now()}`;
  } else {
    const tier = body?.tier as string;
    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    amount    = plan.amount;
    desc      = plan.desc;
    customId  = `${user.id}:${tier}`;
    requestId = `${user.id}-${tier}-${Date.now()}`;
  }

  try {
    const token = await getPayPalToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: amount },
            description: desc,
            custom_id: customId,
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
