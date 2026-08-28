import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleRequest } from "../src/router.js";
import type { Env } from "../src/config.js";

class MockKV {
  store = new Map<string, string>();
  async get(key: string, _type?: any) { return this.store.get(key) || null; }
  async put(key: string, value: string, _opts?: any) { this.store.set(key, value); }
  async delete(key: string) { this.store.delete(key); }
  async list() { return { keys: [], list_complete: true, cacheStatus: null } as any; }
  async getWithMetadata() { return { value: null, metadata: null } as any; }
}
class MockRateLimit {
  shouldFail = false;
  async limit(_opts: any) {
    if (this.shouldFail) {
      const err: any = new Error("Rate limit exceeded");
      err.code = "rate_limited";
      throw err;
    }
    return { success: true } as any;
  }
}
function createMockEnv(overrides: Partial<Env> = {}): Env {
  const mockKv = new MockKV() as unknown as KVNamespace;
  const mockChatLimiter = new MockRateLimit() as unknown as RateLimit;
  const mockContactLimiter = new MockRateLimit() as unknown as RateLimit;
  return {
    AI: { run: vi.fn(async () => ({ response: "Hello from AI" })) } as unknown as Ai,
    RATE_LIMIT_KV: mockKv,
    CHAT_MINUTE_LIMITER: mockChatLimiter,
    CONTACT_MINUTE_LIMITER: mockContactLimiter,
    ALLOWED_ORIGIN: "https://chnetaji.com",
    AI_MODEL: "@cf/qwen/qwen1.5-0.5b-chat",
    CONTACT_TO_EMAIL: "to@example.com",
    CONTACT_FROM_EMAIL: "from@chnetaji.com",
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
  it("PUT /chat -> 405", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "PUT" }), env);
    expect(res.status).toBe(405);
    const body: any = await res.json();
    expect(body.error).toBe("Method not allowed");
  });
  it("DELETE /contact -> 405", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "DELETE" }), env);
    expect(res.status).toBe(405);
  });
});
describe("OPTIONS -> correct CORS response", () => {
  it("returns 204 with CORS headers for allowed origin", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "OPTIONS", headers: { Origin: "https://chnetaji.com" } }), env);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://chnetaji.com");
    expect(res.headers.get("Vary")).toContain("Origin");
  });
});
describe("/chat invalid JSON", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{invalid" }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/chat missing message", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/chat empty message", () => {
  it("rejects empty", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "   " }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("/chat oversized message", () => {
  it("rejects >2000", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "a".repeat(2001) }) }), env);
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
describe("/chat unknown field", () => {
  it("rejects unknown field", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hi", model: "evil" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/contact invalid JSON", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: "not json" }), env);
    expect(res.status).toBe(400);
  });
});
describe("/contact missing name", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "a@b.com", message: "hi" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/contact invalid email", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "not-email", message: "hi" }) }), env);
    expect(res.status).toBe(400);
    expect((await res.json() as any).error).toBe("Invalid request");
  });
});
describe("/contact missing message", () => {
  it("returns 400", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "a@b.com" }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("/contact oversized", () => {
  it("rejects oversized", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "a".repeat(101), email: "a@b.com", message: "hi" }) }), env);
    expect(res.status).toBe(400);
  });
});
describe("honeypot", () => {
  it("silently succeeds when honeypot filled", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "a@b.com", message: "hi", website: "spam" }) }), env);
    expect(res.status).toBe(200);
    expect((await res.json() as any).data.message).toMatch(/received/i);
  });
});
describe("rate limit behavior", () => {
  it("minute limit returns 429 Rate limit exceeded", async () => {
    const env = createMockEnv();
    (env.CHAT_MINUTE_LIMITER as unknown as MockRateLimit).shouldFail = true;
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    const body: any = await res.json();
    expect(body.error).toBe("Rate limit exceeded");
    expect(res.headers.get("Retry-After")).toBeDefined();
  });
});
describe("AI success normalization", () => {
  it("returns data.message", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => ({ response: "AI reply" }));
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.data.message).toBe("AI reply");
    expect(body.meta.requestId).toBeDefined();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
describe("AI provider failure", () => {
  it("returns 500 Internal server error", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => { throw new Error("model error"); });
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(500);
    const body: any = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});
describe("daily AI limit error normalization", () => {
  it("returns 429 Daily limit reached for 3036", async () => {
    const env = createMockEnv();
    (env.AI.run as any) = vi.fn(async () => { throw new Error("Internal error: 3036 Account limited"); });
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    const body: any = await res.json();
    expect(body.error).toBe("Daily limit reached");
  });
  it("also maps Account limited 429", async () => {
    const env = createMockEnv();
    const err: any = new Error("Account limited"); err.status = 429;
    (env.AI.run as any) = vi.fn(async () => { throw err; });
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(429);
    expect((await res.json() as any).error).toBe("Daily limit reached");
  });
});
describe("email success", () => {
  it("returns 200", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John Doe", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(200);
    expect((await res.json() as any).data.message).toMatch(/received/i);
  });
});
describe("email failure", () => {
  it("returns 502 Email service unavailable", async () => {
    const env = createMockEnv({ ENVIRONMENT: "production" } as any);
    env.CONTACT_TO_EMAIL = "to@example.com";
    (env as any).EMAIL = { send: async () => { throw new Error("SMTP error"); } };
    const res = await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello!" }) }), env);
    expect(res.status).toBe(502);
    expect((await res.json() as any).error).toBe("Email service unavailable");
  });
});
describe("CORS rejection", () => {
  it("rejects disallowed origin", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.com" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.status).toBe(403);
    expect((await res.json() as any).error).toBe("Forbidden");
  });
});
describe("request ID propagation", () => {
  it("returns X-Request-ID and echoes provided", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json", "X-Request-ID": "test-123" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.headers.get("X-Request-ID")).toBe("test-123");
    expect((await res.json() as any).meta.requestId).toBe("test-123");
  });
  it("generates ID when not provided", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "hello" }) }), env);
    expect(res.headers.get("X-Request-ID")).toMatch(/^[a-z0-9-]{36}$/i);
  });
});
describe("no sensitive data in logs", () => {
  it("does not log raw email or message", async () => {
    const env = createMockEnv();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await handleRequest(req("https://api.test/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "John", email: "secret@example.com", message: "super secret" }) }), env);
    const logs = consoleSpy.mock.calls.map((c) => String(c[0])).join(" ");
    expect(logs).not.toContain("secret@example.com");
    expect(logs).not.toContain("super secret");
    consoleSpy.mockRestore();
  });
});
describe("Content-Type and body bounds", () => {
  it("rejects wrong Content-Type", async () => {
    const env = createMockEnv();
    const res = await handleRequest(req("https://api.test/chat", { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ message: "hi" }) }), env);
    expect(res.status).toBe(400);
  });
});
