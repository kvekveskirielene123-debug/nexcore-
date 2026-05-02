import { createClient } from "@/lib/supabase/server";
import { stripe, stripePriceIdForPack } from "@/lib/stripe";
import { MARK_PACKS } from "@/lib/ai/modelConfig";
import { NextResponse } from "next/server";

// POST /api/marks/purchase  { packId: 'small' | 'medium' | 'large' }
// Creates a Stripe Checkout session for the selected Mark pack.
export async function POST(request: Request) {
  const body = (await request.json()) as { packId: "small" | "medium" | "large" };
  const { packId } = body;
  const pack = MARK_PACKS.find((p) => p.id === packId);
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, username")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  // Create Stripe Customer if not yet linked
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price: stripePriceIdForPack(packId),
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      pack_id: packId,
      marks: pack.marks.toString(),
    },
    success_url: `${origin}/store?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/store?status=canceled`,
  });

  return NextResponse.json({ url: session.url });
}
