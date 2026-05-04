import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

// POST /api/stripe/subscription-webhook
// Handles subscription lifecycle events from Stripe.
// Register this URL in Stripe Dashboard → Webhooks with these events:
//   checkout.session.completed  (mode: subscription)
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_succeeded
export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.error("Subscription webhook verify failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {

      // ── User completes subscription checkout ────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        if (!subscriptionId || !customerId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_expires_at: expiresAt,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription activated: ${subscriptionId} → expires ${expiresAt}`);
        break;
      }

      // ── Subscription renewed, upgraded, downgraded, or cancelled ──
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // If cancelled at period end, subscription_expires_at stays the same —
        // user keeps access until the period ends naturally.
        // If actually deleted/past_due, clear it.
        const expiresAt =
          sub.status === "active" || sub.status === "trialing"
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null;

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: expiresAt ? sub.id : null,
            subscription_expires_at: expiresAt,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription updated: ${sub.id} status=${sub.status} expires=${expiresAt}`);
        break;
      }

      // ── Subscription hard-deleted by Stripe (e.g. payment failure) ──
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: null,
            subscription_expires_at: null,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription deleted: ${sub.id}`);
        break;
      }

      // ── Invoice paid (monthly/weekly renewal) ──────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason !== "subscription_cycle" &&
            invoice.billing_reason !== "subscription_create") break;

        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;
        if (!subscriptionId || !customerId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_expires_at: expiresAt,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription renewed: ${subscriptionId} → expires ${expiresAt}`);
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error(`Subscription webhook handler error (${event.type}):`, err);
    // Return 200 anyway — Stripe retries on non-2xx, which could cause duplicates
    return NextResponse.json({ received: true, error: err.message });
  }

  return NextResponse.json({ received: true });
}
