import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripeCustomer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/stripe/payment-methods/setup
// Creates a Stripe Checkout session in setup mode so the user can save a new card.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const customerId = await getOrCreateStripeCustomer(user.id, user.email, supabase);

  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: customerId,
    payment_method_types: ["card"],
    success_url: `${origin}/settings/billing/payment-methods?status=added`,
    cancel_url: `${origin}/settings/billing/payment-methods`,
  });

  return NextResponse.json({ url: session.url });
}
