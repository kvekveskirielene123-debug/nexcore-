import { createClient } from "@/lib/supabase/server";
import { verifyPaddleWebhook } from "@/lib/paddle";
import { creditMarks } from "@/lib/marks/balance";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/paddle/webhook
// Register this URL in Paddle Dashboard → Notifications with these events:
//   transaction.completed
//   subscription.activated
//   subscription.updated
//   subscription.cancelled
export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = (await headers()).get("paddle-signature");
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  if (!secret) return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });

  let event: any;
  try {
    event = verifyPaddleWebhook(rawBody, sig, secret);
  } catch (err: any) {
    console.error("Paddle webhook verify failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();
  const { event_type, data } = event;

  try {
    switch (event_type) {

      // ── One-time mark pack purchase ─────────────────────────────────
      case "transaction.completed": {
        const cd = (data.custom_data ?? {}) as Record<string, string>;
        if (cd.type !== "marks") break;

        const userId = cd.user_id;
        const marks = parseInt(cd.marks ?? "0", 10);
        const packId = cd.pack_id;
        const txnId = data.id as string;

        if (!userId || !marks || !packId) {
          console.error("Paddle mark transaction missing metadata", cd);
          break;
        }

        try {
          await creditMarks(userId, marks, `pack_${packId}`, txnId);
          console.log(`Credited ${marks} Marks to ${userId} from Paddle txn ${txnId}`);
        } catch (err: any) {
          // Unique constraint = already credited, idempotent retry
          if (
            err.code === "23505" ||
            err.message?.includes("duplicate") ||
            err.message?.includes("unique")
          ) {
            console.log(`Duplicate Paddle webhook for txn ${txnId} — skipping`);
            break;
          }
          throw err;
        }
        break;
      }

      // ── New subscription activated ──────────────────────────────────
      case "subscription.activated": {
        const customerId = data.customer_id as string;
        if (!customerId) break;
        const expiresAt = (data.current_billing_period?.ends_at as string) ?? null;
        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: data.id,
            subscription_expires_at: expiresAt,
          })
          .eq("stripe_customer_id", customerId);
        console.log(`Subscription activated: ${data.id} expires ${expiresAt}`);
        break;
      }

      // ── Subscription renewed, paused, plan changed ──────────────────
      case "subscription.updated": {
        const customerId = data.customer_id as string;
        if (!customerId) break;
        const isActive = data.status === "active" || data.status === "trialing";
        const expiresAt = isActive
          ? ((data.current_billing_period?.ends_at as string) ?? null)
          : null;
        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: isActive ? data.id : null,
            subscription_expires_at: expiresAt,
          })
          .eq("stripe_customer_id", customerId);
        console.log(`Subscription updated: ${data.id} status=${data.status}`);
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────
      case "subscription.cancelled": {
        const customerId = data.customer_id as string;
        if (!customerId) break;
        // Keep access until billing period ends if gracefully cancelled
        const gracefulEnd =
          (data.scheduled_change?.effective_at as string) ??
          (data.current_billing_period?.ends_at as string) ??
          null;
        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: null,
            subscription_expires_at: gracefulEnd,
          })
          .eq("stripe_customer_id", customerId);
        console.log(`Subscription cancelled: ${data.id} access until ${gracefulEnd}`);
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    console.error(`Paddle webhook handler error (${event_type}):`, err);
    return NextResponse.json({ received: true, error: err.message });
  }

  return NextResponse.json({ received: true });
}
