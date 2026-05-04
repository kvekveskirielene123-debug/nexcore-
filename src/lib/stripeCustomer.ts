import { stripe } from "@/lib/stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns the Stripe customer ID for a user, creating one if it doesn't exist yet. */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string | undefined,
  supabase: SupabaseClient
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, username")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    name: profile?.username ?? undefined,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
