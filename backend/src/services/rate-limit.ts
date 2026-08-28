import type { Env } from "../config.js";
import { RATE_LIMITS } from "../config.js";
import { logRateLimit } from "../utils/logging.js";

// Rate limiting: native for 60s (5/min), KV for 1h (20) and 1d (40)
// IMPORTANT: KV is eventually consistent. Counters may be slightly delayed across isolates.
// This is documented and acceptable for a low-traffic portfolio — strict abuse protection
// is provided by the native 60s limiter (strongly consistent), while hourly/daily are best-effort quotas.
// In-memory Map would NOT work across isolates — KV is required for distributed.

export type RouteType = "chat" | "contact";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds
  limitType?: "minute" | "hour" | "day";
}

async function checkNativeLimit(
  env: Env,
  route: RouteType,
  clientId: string,
): Promise<RateLimitResult> {
  const limiter = route === "chat" ? env.CHAT_MINUTE_LIMITER : env.CONTACT_MINUTE_LIMITER;
  if (!limiter) {
    // No binding configured (local dev) — treat as allowed
    return { allowed: true };
  }
  try {
    // Cloudflare Rate Limiting API: limit({ key }) returns { success } or throws when limited
    // We handle both shapes for compatibility
    const result: any = await (limiter as any).limit({ key: clientId });
    if (result && typeof result.success === "boolean") {
      if (!result.success) {
        const retryAfter = 60 - Math.floor((Date.now() / 1000) % 60);
        return { allowed: false, retryAfter, limitType: "minute" };
      }
      return { allowed: true };
    }
    // If limit() resolves without error, allowed
    return { allowed: true };
  } catch (e: any) {
    // Some Wrangler versions throw when limited — normalize to 429
    // Check for rate limit error code
    const msg = String(e?.message || "");
    if (msg.includes("Rate limit") || msg.includes("429") || e?.code === "rate_limited") {
      const retryAfter = 60 - Math.floor((Date.now() / 1000) % 60);
      return { allowed: false, retryAfter, limitType: "minute" };
    }
    // Other errors — treat as internal but don't block (fail open for availability)
    console.error("native rate limit error", e);
    return { allowed: true };
  }
}

async function checkKvLimit(
  env: Env,
  route: RouteType,
  clientId: string,
  window: "hour" | "day",
): Promise<RateLimitResult> {
  const limits = route === "chat" ? RATE_LIMITS.CHAT : RATE_LIMITS.CONTACT;
  const config = window === "hour" ? limits.HOUR : limits.DAY;
  const windowSec = config.windowSec;
  const limit = config.limit;

  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const key = `rl:${route}:${window}:${clientId}:${bucket}`;

  // KV get with type text
  let current = 0;
  try {
    const val = await env.RATE_LIMIT_KV.get(key);
    if (val) current = parseInt(val, 10) || 0;
  } catch (e) {
    // KV unavailable — fail open
    console.error("kv get error", e);
    return { allowed: true };
  }

  if (current >= limit) {
    const retryAfter = windowSec - Math.floor((now / 1000) % windowSec);
    return { allowed: false, retryAfter, limitType: window };
  }

  // Increment — KV is not atomic, but for low traffic portfolio this is acceptable
  // We use put with expiration TTL = windowSec + 10s buffer
  try {
    await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: windowSec + 10 });
  } catch (e) {
    console.error("kv put error", e);
  }

  return { allowed: true };
}

export async function checkRateLimits(
  env: Env,
  route: RouteType,
  clientId: string,
  requestId: string,
): Promise<RateLimitResult> {
  // 1. Short-window native (60s, 5 req) — strongly consistent
  const minute = await checkNativeLimit(env, route, clientId);
  if (!minute.allowed) {
    logRateLimit({ requestId, route: `/${route}`, limitType: "minute", retryAfter: minute.retryAfter! });
    return minute;
  }

  // 2. Hourly quota (20) — KV, eventually consistent
  const hour = await checkKvLimit(env, route, clientId, "hour");
  if (!hour.allowed) {
    logRateLimit({ requestId, route: `/${route}`, limitType: "hour", retryAfter: hour.retryAfter! });
    return hour;
  }

  // 3. Daily quota (40) — KV
  const day = await checkKvLimit(env, route, clientId, "day");
  if (!day.allowed) {
    logRateLimit({ requestId, route: `/${route}`, limitType: "day", retryAfter: day.retryAfter! });
    return day;
  }

  return { allowed: true };
}
