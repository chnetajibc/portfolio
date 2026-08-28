// API client for Cloudflare Worker backend
// Configurable via VITE_API_BASE_URL — do not hardcode localhost in production

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

export async function postChat(message) {
  // Frontend validation is UX only — backend is authoritative
  if (typeof message !== "string" || !message.trim()) {
    throw Object.assign(new Error("Message cannot be empty"), { code: "VALIDATION_ERROR" });
  }
  const data = await request("/chat", {
    method: "POST",
    body: JSON.stringify({ message: message.trim() }),
  });
  // Normalize: backend returns { data: { message }, meta: { requestId } }
  return data.data?.message || "";
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
