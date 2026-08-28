import type { Env } from "../config.js";
import { validateContactRequest } from "../lib/validation.js";
import { getClientId } from "../lib/client-id.js";
import { checkRateLimits } from "../lib/rate-limit.js";
import { emailService } from "../lib/email.js";
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

  // 2. Rate limit — independent for contact
  const clientId = await getClientId(request);
  const rate = await checkRateLimits(env, "contact", clientId, requestId);
  if (!rate.allowed) {
    return errorResponse(429, "Rate limit exceeded", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  const result = await emailService.sendContactEmail({ name, email, message, requestId, env });
  if (!result.success) {
    logError({ requestId, route: "/contact", errorCode: "EMAIL_SEND_FAILED", status: 502 });
    return errorResponse(502, "Email service unavailable", requestId, { corsHeaders: cors });
  }

  return successResponse({ message: "Message received. Thank you!" }, requestId, cors);
}
