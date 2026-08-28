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

export async function checkChatRateLimit(
  env: Env,
  request: Request,
  requestId: string,
): Promise<RateLimitResult> {
  const limiter = env.CHAT_RATE_LIMIT;
  if (!limiter) {
    return { allowed: true };
  }
  const key = getClientIp(request);
  try {
    const result: any = await (limiter as any).limit({ key });
    if (result && typeof result.success === "boolean") {
      if (!result.success) {
        const retryAfter = 60 - Math.floor((Date.now() / 1000) % 60) || 60;
        logRateLimit({ requestId, route: "/api/chat", retryAfter });
        return { allowed: false, retryAfter };
      }
      return { allowed: true };
    }
    return { allowed: true };
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("Rate limit") || msg.includes("429") || e?.code === "rate_limited") {
      const retryAfter = 60 - Math.floor((Date.now() / 1000) % 60) || 60;
      logRateLimit({ requestId, route: "/api/chat", retryAfter });
      return { allowed: false, retryAfter };
    }
    console.error("rate limit error", e);
    return { allowed: true };
  }
}
