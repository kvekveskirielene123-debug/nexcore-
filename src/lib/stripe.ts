import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY env var");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
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
