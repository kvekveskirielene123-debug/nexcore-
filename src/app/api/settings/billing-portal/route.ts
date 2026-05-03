import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

/**
 * POST /api/settings/billing-portal
 * Creates a Stripe Customer Portal session for the current user.
 * Returns { url } — the client redirects to it.
 *
 * If the user doesn't have a Stripe customer ID yet, we create one first.
 * The customer ID is stored on profiles.stripe_customer_id.
 *
 * ⚠️  Requires profiles.stripe_customer_id column — see README.
 */
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load profile for email + existing stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? null;

    // Create Stripe customer if we don't have one yet
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.username ?? undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save it back to profiles
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create the portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: err.message ?? "Could not open billing portal." },
      { status: 500 }
    );
  }
}
