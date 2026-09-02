import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleRequest } from "../src/router.js";
import { DEFAULTS, ORIGINS, VALIDATION, AI_CONFIG } from "../src/config.js";
import type { Env } from "../src/config.js";
import { CONTACT_TO, CONTACT_FROM } from "../src/lib/email.js";

class MockRateLimit {
  shouldFail = false;
  lastKey: string | null = null;
  async limit(opts: { key: string }) {
    this.lastKey = opts?.key ?? null;
    if (this.shouldFail) {
      const err = Object.assign(new Error("Rate limit exceeded"), { code: "rate_limited" });
      throw err;
    }
    return { success: true } as const;
  }
}
function createMockEnv(overrides: Partial<Env> = {}): Env {
  const mk = () => new MockRateLimit() as unknown as RateLimit;
  const mockEmail = { send: vi.fn(async () => ({ messageId: "test-id" })) } as unknown as SendEmail;
  return {
    AI: { run: vi.fn(async () => ({ response: "Hello from AI" })) } as unknown as Ai,
    CHAT_RATE_LIMIT: mk(),
    CHAT_RATE_LIMIT_HOUR: mk(),
    CHAT_RATE_LIMIT_DAY: mk(),
    CONTACT_RATE_LIMIT: mk(),
    CONTACT_RATE_LIMIT_HOUR: mk(),
    CONTACT_RATE_LIMIT_DAY: mk(),
    EMAIL: mockEmail,
    ALLOWED_ORIGIN: ORIGINS.PROD,
    AI_MODEL: DEFAULTS.AI_MODEL,
    ENVIRONMENT: "test",
    ...overrides,
  } as Env;
}
function req(url: string, init?: RequestInit): Request { return new Request(url, init); }

describe("GET /unknown -> 404", () => {
  it("returns 404", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/unknown"), env);
    expect(res.status).toBe(404);
    const body: any = await res.json();
    expect(body.error).toBe("Not found");
  });
});
describe("unsupported HTTP methods -> 405", () => {
  it("PUT /api/chat -> 405", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "PUT" }), env);
    expect(res.status).toBe(405);
    const body: any = await res.json();
    expect(body.error).toBe("Method not allowed");
  });
  it("DELETE /api/contact -> 405", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "DELETE" }), env);
    expect(res.status).toBe(405);
  });
});
describe("OPTIONS -> correct CORS response", () => {
  it("returns 204 with CORS headers for allowed origin", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "OPTIONS", headers: { Origin: ORIGINS.PROD } }), env);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGINS.PROD);
    expect(res.headers.get("Vary")).toContain("Origin");
  });
});
describe("/api/chat invalid JSON", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{invalid" }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/api/chat missing message", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/api/chat empty message", () => {
  it("rejects empty", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "   " }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("/api/chat oversized message", () => {
  it("rejects >2000", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "a".repeat(VALIDATION.CHAT.MAX_MESSAGE_LENGTH + 1) }) }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/api/chat unknown field", () => {
  it("rejects unknown field", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hi", model: "evil" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/api/contact invalid JSON", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: "not json" }), env);
    expect(res.status).toBe(400);
  });
});
describe("/api/contact missing name", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "a@b.com", message: "hi" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/api/contact invalid email", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "not-email", message: "hi" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/api/contact missing message", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "a@b.com" }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("/api/contact oversized", () => {
  it("rejects oversized", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "a".repeat(VALIDATION.CONTACT.MAX_NAME_LENGTH + 1), email: "a@b.com", message: "hi" }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("honeypot", () => {
  it("silently succeeds when honeypot filled", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "a@b.com", message: "hi", website: "spam" }) }), env);
    expect(res.status).toBe(200);
    expect((await res.json() as any).data.message).toMatch(/received/i);
  });
});
describe("rate limit behavior - chat", () => {
  it("chat 5/min returns 429 Too many requests", async () => {
    const env = createMockEnv();
    (env.CHAT_RATE_LIMIT as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    const body: any = await res.json();
    expect(body.error).toBe("Too many requests. Please try again later.");
    expect(res.headers.get("Retry-After")).toBeDefined();
  });
  it("chat 20/hour returns 429", async () => {
    const env = createMockEnv();
    (env.CHAT_RATE_LIMIT_HOUR as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    expect((await res.json() as any).error).toBe("Too many requests. Please try again later.");
  });
  it("chat 40/day returns 429", async () => {
    const env = createMockEnv();
    (env.CHAT_RATE_LIMIT_DAY as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
  });
  it("uses CF-Connecting-IP as rate limit key", async () => {
    const env = createMockEnv();
    const limiter = env.CHAT_RATE_LIMIT as unknown as MockRateLimit;
    await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "9.9.9.9" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(limiter.lastKey).toBe("9.9.9.9");
  });
});
describe("rate limit behavior - contact", () => {
  it("contact 5/min returns 429", async () => {
    const env = createMockEnv();
    (env.CONTACT_RATE_LIMIT as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(429);
    expect((await res.json() as any).error).toBe("Too many requests. Please try again later.");
    expect(res.headers.get("Retry-After")).toBeDefined();
  });
  it("contact 20/hour returns 429", async () => {
    const env = createMockEnv();
    (env.CONTACT_RATE_LIMIT_HOUR as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(429);
  });
  it("contact 40/day returns 429", async () => {
    const env = createMockEnv();
    (env.CONTACT_RATE_LIMIT_DAY as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(429);
  });
  it("uses CF-Connecting-IP as rate limit key for contact", async () => {
    const env = createMockEnv();
    const limiter = env.CONTACT_RATE_LIMIT as unknown as MockRateLimit;
    await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "5.6.7.8" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(limiter.lastKey).toBe("5.6.7.8");
  });
});
describe("AI success normalization", () => {
  it("returns streaming SSE via non-streaming fallback", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => ({ response: "AI reply" }));
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const text = await res.text();
    expect(text).toContain("AI reply");
    expect(res.headers.get("X-Request-ID")).toBeDefined();
    expect((env.AI.run as any).mock.calls[0][1].stream).toBe(true);
    expect((env.AI.run as any).mock.calls[0][1].max_tokens).toBe(AI_CONFIG.MAX_TOKENS);
  });
  it("returns streaming SSE with proper chunks", async () => {
    const env = createMockEnv();
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ response: "Hello " })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ response: "stream" })}\n\n`));
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    (env.AI.run as any) = vi.fn(async () => stream);
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const text = await res.text();
    expect(text).toContain("Hello ");
    expect(text).toContain("stream");
  });
});
describe("AI provider failure", () => {
  it("returns 500 Internal server error", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => { throw new Error("model error"); });
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(500);
    const body: any = await res.json();
    expect(body.error).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("model error");
  });
});
describe("daily AI limit error normalization", () => {
  it("returns 429 Daily limit reached for 3036", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => { throw new Error("Internal error: 3036 Account limited"); });
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    const body: any = await res.json();
    expect(body.error).toBe("Daily limit reached");
  });
  it("also maps Account limited 429", async () => {
    const env = createMockEnv();
    const err: any = new Error("Account limited"); err.status = 429;
    (env.AI.run as any) = vi.fn(async () => { throw err; });
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    expect((await res.json() as any).error).toBe("Daily limit reached");
  });
});
describe("email success", () => {
  it("returns 200 and calls Cloudflare binding with correct fixed recipient and replyTo", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John Doe", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(200);
    expect((await res.json() as any).data.message).toMatch(/received/i);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const args = (sendSpy as any).mock.calls[0][0];
    expect(args.to).toBe(CONTACT_TO);
    expect(args.to).toBe(DEFAULTS.CONTACT_TO);
    expect(args.from).toBe(CONTACT_FROM);
    expect(args.from).toBe(DEFAULTS.CONTACT_FROM);
    expect(args.replyTo).toBe("john@example.com");
    expect(args.headers).toBeUndefined();
    expect(args.subject).toContain("John Doe");
    expect(args.text).toContain("Hello!");
    expect(args.html).toContain("Hello!");
    expect(args.html).not.toContain("<script");
  });
  it("sanitizes HTML and uses plain-text", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "<b>Alice</b>", email: "alice@example.com", message: "<script>alert(1)</script>" }) }), env);
    expect(res.status).toBe(200);
    const args = (sendSpy as any).mock.calls[0][0];
    expect(args.html).toContain("&lt;script&gt;");
    expect(args.html).not.toContain("<script>");
    expect(args.text).toContain("<script>alert(1)</script>");
  });
});

describe("email recipient cannot be controlled", () => {
  it("rejects request that tries to inject recipient via extra field", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "hi", to: "evil@evil.com" }) }), env);
    expect(res.status).toBe(400);
    expect(sendSpy).not.toHaveBeenCalled();
  });
  it("rejects recipient field variations", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "hi", recipient: "evil@evil.com", destination: "evil@evil.com" }) }), env);
    expect(res.status).toBe(400);
    expect(sendSpy).not.toHaveBeenCalled();
  });
  it("always sends to fixed destination regardless of visitor email domain", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "attacker@evil.com", message: "hi" }) }), env);
    const args = (sendSpy as any).mock.calls[0][0];
    expect(args.to).toBe(DEFAULTS.CONTACT_TO);
    expect(args.to).not.toBe("attacker@evil.com");
  });
  it("visitor email is used only as Reply-To", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "visitor@example.com", message: "hi" }) }), env);
    const args = (sendSpy as any).mock.calls[0][0];
    expect(args.replyTo).toBe("visitor@example.com");
    expect(args.from).not.toBe("visitor@example.com");
    expect(args.to).not.toBe("visitor@example.com");
  });
});

describe("email failure", () => {
  it("returns 502 Email service unavailable without leaking internals", async () => {
    const env = createMockEnv({ ENVIRONMENT: "production" } as any);
    (env as any).EMAIL = { send: async () => { throw new Error("SMTP error internal secret"); } };
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(502);
    const body: any = await res.json();
    expect(body.error).toBe("Email service unavailable");
    expect(JSON.stringify(body)).not.toContain("SMTP error");
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(JSON.stringify(body)).not.toContain("john@example.com");
  });
  it("returns 502 when EMAIL binding missing", async () => {
    const env = createMockEnv();
    (env as any).EMAIL = undefined;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(502);
    expect((await res.json() as any).error).toBe("Email service unavailable");
  });
});

describe("rate limiting before email sending", () => {
  it("does not call EMAIL.send when rate limited on contact", async () => {
    const env = createMockEnv();
    (env.CONTACT_RATE_LIMIT as unknown as MockRateLimit).shouldFail = true;
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(429);
    expect((await res.json() as any).error).toBe("Too many requests. Please try again later.");
    expect(sendSpy).not.toHaveBeenCalled();
  });
  it("hour limit also blocks before email", async () => {
    const env = createMockEnv();
    (env.CONTACT_RATE_LIMIT_HOUR as unknown as MockRateLimit).shouldFail = true;
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(429);
    expect(sendSpy).not.toHaveBeenCalled();
  });
  it("does not call EMAIL.send when validation fails", async () => {
    const env = createMockEnv();
    const sendSpy = env.EMAIL.send as unknown as ReturnType<typeof vi.fn>;
    const res = await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "not-an-email", message: "hi" }) }), env);
    expect(res.status).toBe(400);
    expect(sendSpy).not.toHaveBeenCalled();
  });
});
describe("CORS rejection", () => {
  it("rejects disallowed origin", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.com" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(403);
    expect((await res.json() as any).error).toBe("Forbidden");
  });
});
describe("request ID propagation", () => {
  it("returns X-Request-ID and echoes provided", async () => {
    const env = createMockEnv();
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ response: "ok" })}\n\n`));
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    (env.AI.run as any) = vi.fn(async () => stream);
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "X-Request-ID": "test-123" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.headers.get("X-Request-ID")).toBe("test-123");
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });
  it("generates ID when not provided", async () => {
    const env = createMockEnv();
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ response: "ok" })}\n\n`));
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    (env.AI.run as any) = vi.fn(async () => stream);
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.headers.get("X-Request-ID")).toMatch(/^[a-z0-9-]{36}$/i);
  });
});
describe("no sensitive data in logs", () => {
  it("does not log raw email or message", async () => {
    const env = createMockEnv();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await handleRequest(req("https://api.test/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "secret@example.com", message: "super secret" }) }), env);
    const logs = consoleSpy.mock.calls.map((c) => String(c[0])).join(" ");
    expect(logs).not.toContain("secret@example.com");
    expect(logs).not.toContain("super secret");
    consoleSpy.mockRestore();
  });
});
describe("Content-Type and body bounds", () => {
  it("rejects wrong Content-Type", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ message: "hi" }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("AI stateless - no history", () => {
  it("does not accept history field", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hi", history: [] }) }), env);
    expect(res.status).toBe(400);
  });
});
