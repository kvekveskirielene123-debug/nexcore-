import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Map tier keys to Stripe Price IDs.
// Replace these with your real Stripe Price IDs from Dashboard → Products.
const SUBSCRIPTION_PRICES: Record<string, string> = {
  brilliant_2wk: process.env.STRIPE_PRICE_BRILLIANT_2WK!,
  brilliant_1mo: process.env.STRIPE_PRICE_BRILLIANT_1MO!,
  brilliant_2mo: process.env.STRIPE_PRICE_BRILLIANT_2MO!,
};

/**
 * POST /api/stripe/create-subscription  body: { tier: string }
 * Creates a Stripe Checkout session for a subscription.
 * Returns { url } — the client redirects to it.
 */
export async function POST(request: Request) {
  try {
    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const body = (await request.json()) as { tier: string };
    const { tier } = body;

    const priceId = SUBSCRIPTION_PRICES[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid subscription tier." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.username ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card", "paypal"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
      metadata: {
        supabase_user_id: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Create subscription error:", err);
    return NextResponse.json(
      { error: err.message ?? "Could not create checkout session." },
      { status: 500 }
    );
  }
}
