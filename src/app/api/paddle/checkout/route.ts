import { createClient } from "@/lib/supabase/server";
import {
  createPaddleCustomer,
  createPaddleTransaction,
  paddlePriceIdForPack,
  paddlePriceIdForSubscription,
} from "@/lib/paddle";
import { MARK_PACKS } from "@/lib/ai/modelConfig";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/paddle/checkout
// body: { type: "marks", packId: "small"|"medium"|"large" }
//    or { type: "subscription", tier: "brilliant_2wk"|"brilliant_1mo"|"brilliant_1yr" }
// Returns { url } — client redirects the user there.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type: "marks" | "subscription";
      packId?: "small" | "medium" | "large";
      tier?: string;
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, username")
      .eq("id", user.id)
      .single();

    const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

    let priceId: string;
    let customData: Record<string, string>;
    let successUrl: string;

    if (body.type === "marks") {
      const pack = MARK_PACKS.find((p) => p.id === body.packId);
      if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
      priceId = paddlePriceIdForPack(body.packId!);
      customData = {
        user_id: user.id,
        pack_id: body.packId!,
        marks: pack.marks.toString(),
        type: "marks",
      };
      successUrl = `${origin}/store?status=success`;
    } else if (body.type === "subscription") {
      if (!body.tier) return NextResponse.json({ error: "Missing tier" }, { status: 400 });
      priceId = paddlePriceIdForSubscription(body.tier);
      customData = { user_id: user.id, tier: body.tier, type: "subscription" };
      successUrl = `${origin}/subscribe/thank-you`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Reuse stored Paddle customer ID (stored in stripe_customer_id column).
    // Paddle customer IDs start with "ctm_"; old Stripe IDs start with "cus_".
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId?.startsWith("ctm_")) {
      const customer = await createPaddleCustomer(
        user.email!,
        profile?.username ?? undefined
      );
      customerId = customer.id as string;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const transaction = await createPaddleTransaction({
      priceId,
      customerId,
      customData,
      successUrl,
    });

    const txn = transaction as any;
    return NextResponse.json({
      transactionId: txn.id,
      url: txn.checkout?.url, // fallback redirect if Paddle.js not loaded
    });
  } catch (err: any) {
    console.error("Paddle checkout error:", err);
    return NextResponse.json(
      { error: err.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
