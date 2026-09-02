import type { Env } from "../config.js";
import { validateContactRequest } from "../lib/validation.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { sendContactEmail } from "../lib/email.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { logError } from "../lib/logging.js";

export async function handleContact(
  request: Request,
  env: Env,
  requestId: string,
  corsHeaders: Record<string, string> | null,
): Promise<Response> {
  const cors = corsHeaders || undefined;

  // 1. Validate first
  const validation = await validateContactRequest(request);
  if (!validation.ok) {
    if (validation.honeypotTriggered) {
      return successResponse({ message: "Message received. Thank you!" }, requestId, cors);
    }
    logError({ requestId, route: "/contact", errorCode: "VALIDATION_ERROR", status: 400 });
    return errorResponse(400, "Invalid request", requestId, { corsHeaders: cors });
  }
  const { name, email, message } = validation.data!;

  // 2. Rate limit — native from src/config.ts RATE_LIMITS per IP, before email
  const rate = await checkRateLimit(env, request, requestId, "/api/contact");
  if (!rate.allowed) {
    return errorResponse(429, "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  try {
    await sendContactEmail(env, { name, email, message }, requestId);
  } catch {
    logError({ requestId, route: "/api/contact", errorCode: "EMAIL_SEND_FAILED", status: 502 });
    return errorResponse(502, "Email service unavailable", requestId, { corsHeaders: cors });
  }

  return successResponse({ message: "Message received. Thank you!" }, requestId, cors);
}
