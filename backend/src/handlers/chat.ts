import type { Env } from "../config.js";
import { validateChatRequest } from "../validation/chat.js";
import { getClientId } from "../security/client-id.js";
import { checkRateLimits } from "../services/rate-limit.js";
import { generateChatResponse } from "../services/ai.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { logError } from "../utils/logging.js";

export async function handleChat(
  request: Request,
  env: Env,
  requestId: string,
  corsHeaders: Record<string, string> | null,
): Promise<Response> {
  const cors = corsHeaders || undefined;

  // Rate limiting — privacy-conscious client ID, independent for chat
  const clientId = await getClientId(request);
  const rate = await checkRateLimits(env, "chat", clientId, requestId);
  if (!rate.allowed) {
    return errorResponse(429, "RATE_LIMITED", "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  // Validation
  const validation = await validateChatRequest(request);
  if (!validation.ok) {
    if (validation.error?.includes("Unexpected field") || validation.error?.includes("Invalid request shape")) {
      logError({ requestId, route: "/chat", errorCode: "VALIDATION_ERROR", status: 400 });
      return errorResponse(400, "VALIDATION_ERROR", "Invalid request.", requestId, { corsHeaders: cors });
    }
    logError({ requestId, route: "/chat", errorCode: "VALIDATION_ERROR", status: 400 });
    return errorResponse(400, "VALIDATION_ERROR", validation.error || "Invalid request.", requestId, { corsHeaders: cors });
  }

  const { message } = validation.data!;

  // AI inference — model selected server-side, no client control
  const aiResult = await generateChatResponse(env, message, requestId);

  if (!aiResult.success) {
    if (aiResult.errorCode === "DAILY_LIMIT_REACHED") {
      return errorResponse(429, "DAILY_LIMIT_REACHED", "Daily AI usage limit reached. Please try again tomorrow.", requestId, {
        corsHeaders: cors,
      });
    }
    logError({ requestId, route: "/chat", errorCode: aiResult.errorCode || "AI_UNAVAILABLE", status: 503 });
    return errorResponse(503, "AI_UNAVAILABLE", "AI service temporarily unavailable. Please try again later.", requestId, {
      corsHeaders: cors,
    });
  }

  // Success — normalize, enforce <200 tokens via model config + defensive truncation
  const text = aiResult.message!.slice(0, 1000);
  return successResponse({ message: text }, requestId, cors);
}
