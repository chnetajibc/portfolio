import type { Env } from "../config.js";
import { validateChatRequest } from "../lib/validation.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { errorResponse } from "../lib/response.js";
import { logError, logAi } from "../lib/logging.js";
import { AI_CONFIG } from "../config.js";
import { SYSTEM_INSTRUCTIONS, GUARDRAILS } from "../ai/system-instructions.js";
import { PORTFOLIO_CONTEXT } from "../ai/portfolio-context.js";

export async function handleChat(
  request: Request,
  env: Env,
  requestId: string,
  corsHeaders: Record<string, string> | null,
): Promise<Response> {
  const cors = corsHeaders || undefined;

  // 1. Validate first (before rate limit, don't consume quota for invalid)
  const validation = await validateChatRequest(request);
  if (!validation.ok) {
    logError({ requestId, route: "/api/chat", errorCode: "VALIDATION_ERROR", status: 400 });
    return errorResponse(400, "Invalid request", requestId, { corsHeaders: cors });
  }
  const { message } = validation.data!;

  // 2. Rate limit — native Workers Rate Limiting, 5/min, 20/hour, 40/day per IP
  const rate = await checkRateLimit(env, request, requestId, "/api/chat");
  if (!rate.allowed) {
    return errorResponse(429, "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  // 3. AI inference — streaming via official Workers AI stream:true, piped directly
  const model = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTIONS },
    { role: "system", content: PORTFOLIO_CONTEXT },
    { role: "system", content: GUARDRAILS },
    { role: "user", content: message },
  ];
  const start = Date.now();
  try {
    const stream = (await env.AI.run(model as never, {
      messages,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      stream: true,
    } as never)) as unknown as ReadableStream;
    if (stream && typeof (stream as unknown as { getReader?: unknown }).getReader === "function") {
      logAi({ requestId, model, durationMs: Date.now() - start, success: true });
      const headers = new Headers();
      headers.set("Content-Type", "text/event-stream; charset=utf-8");
      headers.set("Cache-Control", "no-cache");
      headers.set("X-Request-ID", requestId);
      headers.set("Vary", "Origin");
      if (cors) for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(stream as unknown as BodyInit, { headers });
    }
    const text = (stream as unknown as { response?: string })?.response ?? "AI response";
    const sseStream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ response: String(text) })}\n\n`));
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    logAi({ requestId, model, durationMs: Date.now() - start, success: true });
    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache");
    headers.set("X-Request-ID", requestId);
    headers.set("Vary", "Origin");
    if (cors) for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(sseStream as unknown as BodyInit, { headers });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    const msg = String(err?.message || "");
    const lower = msg.toLowerCase();
    const isDailyLimit = msg.includes("3036") || lower.includes("account limited") || (err?.status === 429 && lower.includes("account limited"));
    if (isDailyLimit) {
      logAi({ requestId, model, durationMs: Date.now() - start, success: false, errorCode: "DAILY_LIMIT_REACHED" });
      return errorResponse(429, "Daily limit reached", requestId, { corsHeaders: cors });
    }
    logAi({ requestId, model, durationMs: Date.now() - start, success: false, errorCode: "AI_UNAVAILABLE" });
    logError({ requestId, route: "/api/chat", errorCode: "AI_UNAVAILABLE", status: 500 });
    return errorResponse(500, "Internal server error", requestId, { corsHeaders: cors });
  }
}
