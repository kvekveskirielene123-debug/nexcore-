import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const VALID_REASONS = [
  "too_expensive",
  "not_enough_usage",
  "missing_feature",
  "going_to_competitor",
  "taking_a_break",
  "other",
] as const;

type CancelReason = (typeof VALID_REASONS)[number];

/**
 * POST /api/settings/cancel-subscription
 * body: { reason: CancelReason, other_text?: string }
 *
 * 1. Cancels the Stripe subscription at period end (user keeps access until expiry)
 * 2. Saves the cancel reason to profiles for analytics
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reason: CancelReason;
      other_text?: string;
    };

    if (!VALID_REASONS.includes(body.reason)) {
      return NextResponse.json({ error: "Invalid reason." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load subscription ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 400 }
      );
    }

    // Cancel at period end — user keeps access until subscription_expires_at
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Save cancel reason to DB (for analytics / improving the product)
    await supabase
      .from("profiles")
      .update({
        subscription_cancel_reason: body.reason,
        subscription_cancel_other:
          body.reason === "other"
            ? (body.other_text?.trim().slice(0, 500) ?? null)
            : null,
      })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: err.message ?? "Could not cancel subscription." },
      { status: 500 }
    );
  }
}
