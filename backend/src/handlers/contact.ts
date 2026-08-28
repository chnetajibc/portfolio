import type { Env } from "../config.js";
import { validateContactRequest } from "../validation/contact.js";
import { getClientId } from "../security/client-id.js";
import { checkRateLimits } from "../services/rate-limit.js";
import { emailService } from "../services/email.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { logError } from "../utils/logging.js";

export async function handleContact(
  request: Request,
  env: Env,
  requestId: string,
  corsHeaders: Record<string, string> | null,
): Promise<Response> {
  const cors = corsHeaders || undefined;

  // Rate limiting — independent for contact
  const clientId = await getClientId(request);
  const rate = await checkRateLimits(env, "contact", clientId, requestId);
  if (!rate.allowed) {
    return errorResponse(429, "RATE_LIMITED", "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  const validation = await validateContactRequest(request);
  if (!validation.ok) {
    // Honeypot — silently succeed without revealing
    if (validation.honeypotTriggered) {
      // Do not log email, just return success to avoid spam detection
      return successResponse({ message: "Message received. Thank you!" }, requestId, cors);
    }
    logError({ requestId, route: "/contact", errorCode: "VALIDATION_ERROR", status: 400 });
    return errorResponse(400, "VALIDATION_ERROR", validation.error || "Invalid request.", requestId, { corsHeaders: cors });
  }

  const { name, email, message } = validation.data!;

  const result = await emailService.sendContactEmail({ name, email, message, requestId, env });
  if (!result.success) {
    logError({ requestId, route: "/contact", errorCode: "EMAIL_SEND_FAILED", status: 502 });
    return errorResponse(502, "EMAIL_SEND_FAILED", "Failed to send email. Please try again later.", requestId, {
      corsHeaders: cors,
    });
  }

  return successResponse({ message: "Message received. Thank you!" }, requestId, cors);
}
