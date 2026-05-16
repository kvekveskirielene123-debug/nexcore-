import { stripe } from "@/lib/stripe";
import { creditMarks } from "@/lib/marks/balance";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/marks/webhook
// Stripe fires this when a Checkout session completes.
// We credit the user's Marks balance and log the transaction.
export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook verify failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.user_id;
    const marks = parseInt(session.metadata?.marks ?? "0", 10);
    const packId = session.metadata?.pack_id;

    if (!userId || !marks || !packId) {
      console.error("Webhook missing metadata", session.metadata);
      return NextResponse.json({ received: true });
    }

    try {
      await creditMarks(userId, marks, `pack_${packId}`, session.id);
      console.log(`Credited ${marks} Marks to ${userId} from ${session.id}`);
    } catch (err: any) {
      // Unique constraint = already credited (idempotent Stripe retry)
      if (err.code === "23505" || err.message?.includes("duplicate") || err.message?.includes("unique")) {
        console.log(`Duplicate webhook for session ${session.id} — skipping`);
        return NextResponse.json({ received: true });
      }
      console.error("Mark credit failed:", err);
      return NextResponse.json({ error: "Credit failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
