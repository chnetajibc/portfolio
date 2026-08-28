// API client for Cloudflare Worker backend
import { createParser } from "eventsource-parser";

const API_BASE = "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = {
      error: {
        code: "INTERNAL_ERROR",
        message: "Invalid response",
      },
    };
  }

  if (!res.ok) {
    const errorData =
      typeof body?.error === "string" ? body.error : body?.error;

    const code =
      typeof errorData === "object"
        ? errorData?.code
        : "INTERNAL_ERROR";

    const message =
      typeof errorData === "object"
        ? errorData?.message
        : errorData || "Request failed";

    const retryAfter =
      typeof errorData === "object"
        ? errorData?.retryAfter
        : res.headers.get("Retry-After");

    const error = new Error(message);
    error.code = code;
    error.status = res.status;
    error.retryAfter = retryAfter
      ? parseInt(String(retryAfter), 10)
      : undefined;
    error.body = body;

    throw error;
  }

  return body;
}

export async function postChat(message, opts = {}) {
  if (typeof message !== "string" || !message.trim()) {
    throw Object.assign(
      new Error("Message cannot be empty"),
      { code: "VALIDATION_ERROR" }
    );
  }

  const { onChunk, signal } = opts;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      message: message.trim(),
    }),
    signal,
  });

  if (!res.ok) {
    let body = null;

    try {
      const text = await res.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      // Ignore invalid error response.
    }

    const errorData =
      typeof body?.error === "string"
        ? body.error
        : body?.error;

    const code =
      typeof errorData === "object"
        ? errorData?.code
        : "INTERNAL_ERROR";

    const message =
      typeof errorData === "object"
        ? errorData?.message
        : errorData || res.statusText || "Request failed";

    const retryAfter =
      typeof errorData === "object"
        ? errorData?.retryAfter
        : res.headers.get("Retry-After");

    const error = new Error(message);
    error.code = code;
    error.status = res.status;
    error.retryAfter = retryAfter
      ? parseInt(String(retryAfter), 10)
      : undefined;
    error.body = body;

    throw error;
  }

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("text/event-stream")) {
    const text = await res.text();

    try {
      const body = text ? JSON.parse(text) : null;
      const full = body?.data?.message || text || "";

      if (full && typeof onChunk === "function") {
        onChunk(full, full);
      }

      return full;
    } catch {
      return text;
    }
  }

  if (!res.body) {
    throw Object.assign(
      new Error("Empty response from chat service"),
      { code: "INTERNAL_ERROR" }
    );
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

      const token =
        parsed.response ??
        parsed.choices?.[0]?.delta?.content ??
        "";

      if (token) {
        full += token;

        if (typeof onChunk === "function") {
          onChunk(token, full);
        }
      }
    } catch {
      // Ignore malformed stream chunks.
    }
  });

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    parser.feed(
      decoder.decode(value, { stream: true })
    );
  }

  parser.feed(decoder.decode());

  return full;
}

export async function postContact({
  name,
  email,
  message,
  website,
}) {
  const payload = {
    name,
    email,
    message,
  };

  if (website !== undefined) {
    payload.website = website;
  }

  const data = await request("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.data?.message || "Message received";
}
