import type { Env } from "../config.js";
import { logRateLimit } from "./logging.js";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    request.headers.get("X-Real-IP") ||
    "unknown"
  );
}

async function checkSingleLimit(
  limiter: RateLimit | undefined,
  key: string,
  requestId: string,
  route: string,
): Promise<RateLimitResult> {
  if (!limiter) return { allowed: true };
  try {
    const result = await limiter.limit({ key });
    if (result && typeof result.success === "boolean" && !result.success) {
      const retryAfter = 60 - (Math.floor(Date.now() / 1000) % 60) || 60;
      logRateLimit({ requestId, route, retryAfter });
      return { allowed: false, retryAfter };
    }
    return { allowed: true };
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string };
    const msg = String(err?.message || "");
    if (msg.includes("Rate limit") || msg.includes("429") || err?.code === "rate_limited") {
      const retryAfter = 60 - (Math.floor(Date.now() / 1000) % 60) || 60;
      logRateLimit({ requestId, route, retryAfter });
      return { allowed: false, retryAfter };
    }
    console.error("rate limit error", e);
    return { allowed: true };
  }
}

export async function checkRateLimit(
  env: Env,
  request: Request,
  requestId: string,
  route: "/api/chat" | "/api/contact",
): Promise<RateLimitResult> {
  const key = getClientIp(request);
  const isChat = route === "/api/chat";
  const limiters: Array<RateLimit | undefined> = isChat
    ? [env.CHAT_RATE_LIMIT, env.CHAT_RATE_LIMIT_HOUR, env.CHAT_RATE_LIMIT_DAY]
    : [env.CONTACT_RATE_LIMIT, env.CONTACT_RATE_LIMIT_HOUR, env.CONTACT_RATE_LIMIT_DAY];

  for (const limiter of limiters) {
    const res = await checkSingleLimit(limiter, key, requestId, route);
    if (!res.allowed) return res;
  }
  return { allowed: true };
}

// Backwards compat for existing tests that call checkChatRateLimit
export const checkChatRateLimit = (
  env: Env,
  request: Request,
  requestId: string,
): Promise<RateLimitResult> => checkRateLimit(env, request, requestId, "/api/chat");
