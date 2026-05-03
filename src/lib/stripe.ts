import Stripe from "stripe";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY env var");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    typescript: true,
  });
}

let _stripe: Stripe | null = null;
export function getStripeClient(): Stripe {
  if (!_stripe) _stripe = getStripe();
  return _stripe;
}

// Keep backward-compat export for direct imports
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripeClient() as any)[prop];
  },
});

// Map Mark pack IDs to their Stripe price IDs (set in env)
export function stripePriceIdForPack(packId: "small" | "medium" | "large"): string {
  const key =
    packId === "small"
      ? "STRIPE_PRICE_MARKS_SMALL"
      : packId === "medium"
      ? "STRIPE_PRICE_MARKS_MEDIUM"
      : "STRIPE_PRICE_MARKS_LARGE";
  const id = process.env[key];
  if (!id) throw new Error(`Missing env var: ${key}`);
  return id;
}
