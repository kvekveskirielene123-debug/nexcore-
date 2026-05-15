/**
 * Simple in-process rate limiter.
 * Works for single-instance / serverless (resets per cold start).
 * For multi-instance production: replace with Upstash Redis.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Clean up stale keys every 5 minutes to avoid memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((v, k) => { if (v.resetAt < now) store.delete(k); });
  }, 5 * 60 * 1000);
}

/**
 * Returns true if the key is within rate limit, false if exceeded.
 * @param key     Unique key (e.g. `chat:${userId}`)
 * @param limit   Max requests per window
 * @param windowMs Window duration in ms
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
