import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/stripe/payment-methods/set-default  body: { paymentMethodId }
// Sets the customer's default payment method for subscriptions and future invoices.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = (await request.json()) as { paymentMethodId: string };
  if (!paymentMethodId) return NextResponse.json({ error: "Missing paymentMethodId" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) return NextResponse.json({ error: "No customer" }, { status: 400 });

  // Verify ownership
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== profile.stripe_customer_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await stripe.customers.update(profile.stripe_customer_id, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  return NextResponse.json({ ok: true });
}
