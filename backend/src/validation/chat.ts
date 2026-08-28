import { VALIDATION } from "../config.js";

export interface ChatRequest {
  message: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Bounded JSON parse — caller should have checked Content-Type and size
export async function validateChatRequest(request: Request): Promise<ValidationResult<ChatRequest>> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, error: "Content-Type must be application/json" };
  }

  // Bounded body — clone and check size
  // Workers Request has no direct size, so we read text and check byte length
  let raw: string;
  try {
    raw = await request.clone().text();
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
  if (new TextEncoder().encode(raw).length > VALIDATION.CHAT.MAX_BODY_BYTES) {
    return { ok: false, error: "Request body too large" };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request shape" };
  }

  const obj = body as Record<string, unknown>;

  // Reject arbitrary model selection / prompt injection fields — only allow message
  const allowedKeys = new Set(["message"]);
  for (const k of Object.keys(obj)) {
    if (!allowedKeys.has(k)) {
      return { ok: false, error: `Unexpected field: ${k}` };
    }
  }

  if (!("message" in obj)) {
    return { ok: false, error: "Missing message" };
  }

  if (typeof obj.message !== "string") {
    return { ok: false, error: "message must be a string" };
  }

  let message = obj.message.trim();
  if (message.length < VALIDATION.CHAT.MIN_MESSAGE_LENGTH) {
    return { ok: false, error: "message cannot be empty" };
  }
  if (message.length > VALIDATION.CHAT.MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `message too long (max ${VALIDATION.CHAT.MAX_MESSAGE_LENGTH})` };
  }

  // Reject obviously malformed — e.g., message is just whitespace or control chars only
  if (!/\S/.test(message)) {
    return { ok: false, error: "message cannot be empty" };
  }

  // Defensive: strip excessive whitespace normalization (single spaces)
  // Keep original but trimmed — don't alter meaning
  return { ok: true, data: { message } };
}
