import type { Env } from "../config.js";
import { validateChatRequest } from "../lib/validation.js";
import { checkChatRateLimit } from "../lib/rate-limit.js";
import { generateChatResponse } from "../lib/ai.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { logError } from "../lib/logging.js";

export async function handleChat(
  request: Request,
  env: Env,
  requestId: string,
  corsHeaders: Record<string, string> | null,
): Promise<Response> {
  const cors = corsHeaders || undefined;

  // 1. Validate first (before rate limit, don't consume quota for invalid)
  const validation = await validateChatRequest(request);
  if (!validation.ok) {
    logError({ requestId, route: "/api/chat", errorCode: "VALIDATION_ERROR", status: 400 });
    return errorResponse(400, "Invalid request", requestId, { corsHeaders: cors });
  }
  const { message } = validation.data!;

  // 2. Rate limit — native Workers Rate Limiting, 5 per 60s per IP
  const rate = await checkChatRateLimit(env, request, requestId);
  if (!rate.allowed) {
    return errorResponse(429, "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  // 3. AI inference — model server-side, no client control
  const aiResult = await generateChatResponse(env, message, requestId);

  if (!aiResult.success) {
    if (aiResult.errorCode === "DAILY_LIMIT_REACHED") {
      return errorResponse(429, "Daily limit reached", requestId, { corsHeaders: cors });
    }
    logError({ requestId, route: "/api/chat", errorCode: aiResult.errorCode || "AI_UNAVAILABLE", status: 500 });
    return errorResponse(500, "Internal server error", requestId, { corsHeaders: cors });
  }

  const text = aiResult.message!.slice(0, 1000);
  return successResponse({ message: text }, requestId, cors);
}
