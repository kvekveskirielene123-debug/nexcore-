import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/stripe/payment-methods
// Returns saved payment methods for the current user.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ methods: [], defaultMethodId: null });
  }

  const customerId = profile.stripe_customer_id;

  const [cardList, customer] = await Promise.all([
    stripe.paymentMethods.list({ customer: customerId, type: "card", limit: 20 }),
    stripe.customers.retrieve(customerId),
  ]);

  const defaultMethodId: string | null =
    !customer.deleted
      ? ((customer as any).invoice_settings?.default_payment_method ?? null)
      : null;

  return NextResponse.json({
    methods: cardList.data,
    defaultMethodId,
  });
}

// DELETE /api/stripe/payment-methods  body: { paymentMethodId }
// Detaches a payment method from the customer.
export async function DELETE(request: Request) {
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

  if (!profile?.stripe_customer_id) return NextResponse.json({ error: "No payment methods" }, { status: 400 });

  // Verify this payment method belongs to this customer before detaching
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== profile.stripe_customer_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await stripe.paymentMethods.detach(paymentMethodId);
  return NextResponse.json({ ok: true });
}
