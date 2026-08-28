// API client for Cloudflare Worker backend
// Configurable via VITE_API_BASE_URL — do not hardcode localhost in production
import { createParser } from "eventsource-parser";

const API_BASE = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) || "http://localhost:8787";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Always try to parse JSON, even for errors
  let body;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: { code: "INTERNAL_ERROR", message: "Invalid response" } };
  }

  if (!res.ok) {
    const code = body?.error?.code || "INTERNAL_ERROR";
    const message = body?.error?.message || "Request failed";
    const retryAfter = body?.error?.retryAfter || res.headers.get("Retry-After");
    const error = new Error(message);
    error.code = code;
    error.status = res.status;
    error.retryAfter = retryAfter ? parseInt(String(retryAfter), 10) : undefined;
    error.body = body;
    throw error;
  }

  return body;
}

export async function postChat(message, opts = {}) {
  // Frontend validation is UX only — backend is authoritative
  if (typeof message !== "string" || !message.trim()) {
    throw Object.assign(new Error("Message cannot be empty"), { code: "VALIDATION_ERROR" });
  }
  const { onChunk, signal } = opts || {};

  // Streaming only — always request event-stream and parse SSE via official parser
  const url = `${API_BASE}/api/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ message: message.trim() }),
    signal,
  });

  if (!res.ok) {
    let body = null;
    try {
      const txt = await res.text();
      body = txt ? JSON.parse(txt) : null;
    } catch {
      body = null;
    }
    const code = body?.error?.code || "INTERNAL_ERROR";
    const msg = body?.error || body?.error?.message || body?.message || res.statusText || "Request failed";
    const retryAfter = body?.error?.retryAfter || res.headers.get("Retry-After");
    const error = new Error(typeof msg === "string" ? msg : msg.message || "Request failed");
    error.code = code;
    error.status = res.status;
    error.retryAfter = retryAfter ? parseInt(String(retryAfter), 10) : undefined;
    error.body = body;
    throw error;
  }

  const contentType = res.headers.get("content-type") || "";
  // Fallback if server somehow returned JSON (e.g., mock)
  if (!contentType.includes("text/event-stream")) {
    const txt = await res.text();
    try {
      const body = txt ? JSON.parse(txt) : null;
      const full = body?.data?.message || txt || "";
      if (full && typeof onChunk === "function") onChunk(full, full);
      return full;
    } catch {
      return txt;
    }
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  const parser = createParser((event) => {
    if (event.type !== "event") return;
    const data = event.data;
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data);
      const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
      if (token) {
        full += token;
        if (typeof onChunk === "function") onChunk(token, full);
      }
    } catch {
      // ignore malformed
    }
  });
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
  // If no onChunk was provided (tests), still return full
  return full;
}

export async function postContact({ name, email, message, website }) {
  // website is honeypot — if filled, still send but backend will silently handle
  const payload = { name, email, message };
  if (website !== undefined) payload.website = website;

  const data = await request("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data?.message || "Message received";
}

export { API_BASE };
