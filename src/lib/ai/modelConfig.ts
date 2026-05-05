// Central config for AI models
// Edit this file when Anthropic releases new models or pricing changes.

export type ModelKey = "haiku" | "sonnet" | "opus";

export interface ModelConfig {
  key: ModelKey;
  label: string;
  anthropicId: string;
  costStandard: number;   // Marks per message for non-subscribers
  costSubscriber: number; // Marks per message for active subscribers (0 = included in subscription)
  description: string;
  accentColor: string;
}

export const MODELS: Record<ModelKey, ModelConfig> = {
  haiku: {
    key: "haiku",
    label: "HAIKU",
    anthropicId: "claude-haiku-4-5-20251001",
    costStandard: 3,
    costSubscriber: 0,
    description: "Fast. Included with subscription.",
    accentColor: "#7a6a9a",
  },
  sonnet: {
    key: "sonnet",
    label: "SONNET",
    anthropicId: "claude-sonnet-4-6",
    costStandard: 10,
    costSubscriber: 8,
    description: "Balanced. Richer responses.",
    accentColor: "#a78bfa",
  },
  opus: {
    key: "opus",
    label: "OPUS",
    anthropicId: "claude-opus-4-7",
    costStandard: 25,
    costSubscriber: 19,
    description: "Premium. Most alive.",
    accentColor: "#00e5ff",
  },
};

export function getModelCost(model: ModelKey, isSubscriber: boolean): number {
  const cfg = MODELS[model];
  return isSubscriber ? cfg.costSubscriber : cfg.costStandard;
}

export function isSubscriptionActive(
  subscriptionExpiresAt: string | null | undefined
): boolean {
  if (!subscriptionExpiresAt) return false;
  return new Date(subscriptionExpiresAt) > new Date();
}

// Phase 2 will add: bubble styles, frames. For now stubs:
export const DEFAULT_BUBBLE_STYLE = "default";
export const DEFAULT_FRAME = "none";

// Mark packs
export interface MarkPack {
  id: "small" | "medium" | "large";
  marks: number;
  priceUsd: number;
  priceCents: number;
  priceLabel: string;
  stripePriceEnvKey: string;
  best_value?: boolean;
}

export const MARK_PACKS: MarkPack[] = [
  {
    id: "small",
    marks: 500,
    priceUsd: 2.99,
    priceCents: 299,
    priceLabel: "$2.99",
    stripePriceEnvKey: "STRIPE_PRICE_MARKS_SMALL",
  },
  {
    id: "medium",
    marks: 1200,
    priceUsd: 4.99,
    priceCents: 499,
    priceLabel: "$4.99",
    stripePriceEnvKey: "STRIPE_PRICE_MARKS_MEDIUM",
  },
  {
    id: "large",
    marks: 3000,
    priceUsd: 11.99,
    priceCents: 1199,
    priceLabel: "$11.99",
    stripePriceEnvKey: "STRIPE_PRICE_MARKS_LARGE",
    best_value: true,
  },
];

// Mark earning limits
export const MARKS_DAILY_BONUS = 50;
export const MARKS_DAILY_BONUS_SUBSCRIBER = 100;
export const MARKS_PER_AD = 50;
export const MAX_ADS_PER_30_MIN = 5; // Phase 2 enforcement
export const SIGNUP_BONUS = 75;
