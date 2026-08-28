import { VALIDATION } from "../config.js";

export interface ChatRequest { message: string; }
export interface ContactRequest { name: string; email: string; message: string; }

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  honeypotTriggered?: boolean;
}

function normalizeWhitespace(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}
function normalizeMessage(s: string): string {
  return s.trim().replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
}
function isValidEmail(email: string): boolean {
  if (email.length > VALIDATION.CONTACT.MAX_EMAIL_LENGTH) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  if (/[\r\n]/.test(email)) return false;
  return true;
}
function hasHeaderInjection(s: string): boolean {
  return /[\r\n]/.test(s);
}
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

export async function validateChatRequest(request: Request): Promise<ValidationResult<ChatRequest>> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, error: "Content-Type must be application/json" };
  }
  let raw: string;
  try { raw = await request.clone().text(); } catch { return { ok: false, error: "Invalid JSON body" }; }
  if (new TextEncoder().encode(raw).length > VALIDATION.CHAT.MAX_BODY_BYTES) {
    return { ok: false, error: "Request body too large" };
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return { ok: false, error: "Invalid JSON" }; }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request shape" };
  }
  const obj = body as Record<string, unknown>;
  const allowedKeys = new Set(["message"]);
  for (const k of Object.keys(obj)) if (!allowedKeys.has(k)) return { ok: false, error: `Unexpected field: ${k}` };
  if (!("message" in obj)) return { ok: false, error: "Missing message" };
  if (typeof obj.message !== "string") return { ok: false, error: "message must be a string" };
  let message = obj.message.trim();
  if (message.length < VALIDATION.CHAT.MIN_MESSAGE_LENGTH) return { ok: false, error: "message cannot be empty" };
  if (message.length > VALIDATION.CHAT.MAX_MESSAGE_LENGTH) return { ok: false, error: `message too long (max ${VALIDATION.CHAT.MAX_MESSAGE_LENGTH})` };
  if (!/\S/.test(message)) return { ok: false, error: "message cannot be empty" };
  return { ok: true, data: { message } };
}

export async function validateContactRequest(request: Request): Promise<ValidationResult<ContactRequest>> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, error: "Content-Type must be application/json" };
  }
  let raw: string;
  try { raw = await request.clone().text(); } catch { return { ok: false, error: "Invalid JSON body" }; }
  if (new TextEncoder().encode(raw).length > VALIDATION.CONTACT.MAX_BODY_BYTES) {
    return { ok: false, error: "Request body too large" };
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return { ok: false, error: "Invalid JSON" }; }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Invalid request shape" };
  }
  const obj = body as Record<string, unknown>;
  const honeypotField = VALIDATION.CONTACT.HONEYPOT_FIELD;
  if (honeypotField in obj) {
    const val = obj[honeypotField];
    if (typeof val === "string" && val.trim().length > 0) return { ok: false, error: "Invalid request", honeypotTriggered: true };
  }
  const allowedKeys = new Set(["name", "email", "message", honeypotField]);
  for (const k of Object.keys(obj)) if (!allowedKeys.has(k)) return { ok: false, error: `Unexpected field: ${k}` };
  if (!("name" in obj) || typeof obj.name !== "string") return { ok: false, error: "Missing name" };
  let name = normalizeWhitespace(obj.name as string);
  if (name.length < VALIDATION.CONTACT.MIN_NAME_LENGTH) return { ok: false, error: "name cannot be empty" };
  if (name.length > VALIDATION.CONTACT.MAX_NAME_LENGTH) return { ok: false, error: `name too long (max ${VALIDATION.CONTACT.MAX_NAME_LENGTH})` };
  if (hasHeaderInjection(name)) return { ok: false, error: "Invalid name" };
  if (!("email" in obj) || typeof obj.email !== "string") return { ok: false, error: "Missing email" };
  let email = (obj.email as string).trim().toLowerCase();
  if (email.length === 0) return { ok: false, error: "email cannot be empty" };
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email format" };
  if (hasHeaderInjection(email)) return { ok: false, error: "Invalid email" };
  if (!("message" in obj) || typeof obj.message !== "string") return { ok: false, error: "Missing message" };
  let message = normalizeMessage(obj.message as string);
  if (message.length < VALIDATION.CONTACT.MIN_MESSAGE_LENGTH) return { ok: false, error: "message cannot be empty" };
  if (message.length > VALIDATION.CONTACT.MAX_MESSAGE_LENGTH) return { ok: false, error: `message too long (max ${VALIDATION.CONTACT.MAX_MESSAGE_LENGTH})` };
  if (hasHeaderInjection(name) || hasHeaderInjection(email)) return { ok: false, error: "Invalid input" };
  return { ok: true, data: { name, email, message } };
}
