import { createHmac } from "crypto";

const BASE =
  process.env.PADDLE_ENVIRONMENT === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

async function req(path: string, method: string, body?: object) {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("Missing PADDLE_API_KEY");
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json() as any;
  if (!res.ok) throw new Error(json.error?.detail ?? `Paddle API ${res.status}`);
  return json.data;
}

export async function createPaddleCustomer(email: string, name?: string) {
  return req("/customers", "POST", { email, name });
}

export async function createPaddleTransaction(opts: {
  priceId: string;
  customerId: string;
  customData: Record<string, string>;
  successUrl: string;
}) {
  return req("/transactions", "POST", {
    items: [{ price_id: opts.priceId, quantity: 1 }],
    customer_id: opts.customerId,
    custom_data: opts.customData,
    checkout: { url: opts.successUrl },
  });
}

export function verifyPaddleWebhook(rawBody: string, sigHeader: string, secret: string): any {
  const parts: Record<string, string> = {};
  sigHeader.split(";").forEach(p => { const [k, v] = p.split("="); parts[k] = v; });
  const { ts, h1 } = parts;
  if (!ts || !h1) throw new Error("Malformed Paddle-Signature");
  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  if (expected !== h1) throw new Error("Invalid Paddle webhook signature");
  return JSON.parse(rawBody);
}

export function paddlePriceIdForPack(packId: "small" | "medium" | "large"): string {
  const key =
    packId === "small" ? "PADDLE_PRICE_MARKS_SMALL"
    : packId === "medium" ? "PADDLE_PRICE_MARKS_MEDIUM"
    : "PADDLE_PRICE_MARKS_LARGE";
  const id = process.env[key];
  if (!id) throw new Error(`Missing env var: ${key}`);
  return id;
}

export function paddlePriceIdForSubscription(tier: string): string {
  const map: Record<string, string | undefined> = {
    brilliant_2wk: process.env.PADDLE_PRICE_BRILLIANT_2WK,
    brilliant_1mo: process.env.PADDLE_PRICE_BRILLIANT_1MO,
    brilliant_2mo: process.env.PADDLE_PRICE_BRILLIANT_2MO,
  };
  const id = map[tier];
  if (!id) throw new Error(`Invalid or unconfigured subscription tier: ${tier}`);
  return id;
}
