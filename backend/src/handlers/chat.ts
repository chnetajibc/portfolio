import type { Env } from "../config.js";
import { validateChatRequest } from "../lib/validation.js";
import { checkChatRateLimit } from "../lib/rate-limit.js";
import { generateChatResponse } from "../lib/ai.js";
import { errorResponse, successResponse } from "../lib/response.js";
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

  // 2. Rate limit — native Workers Rate Limiting, 5 per 60s per IP
  const rate = await checkChatRateLimit(env, request, requestId);
  if (!rate.allowed) {
    return errorResponse(429, "Too many requests. Please try again later.", requestId, {
      retryAfter: rate.retryAfter,
      corsHeaders: cors,
    });
  }

  // 3. AI inference — model server-side, no client control
  // If client accepts event-stream, return streaming response directly (stream:true)
  const wantsStream = request.headers.get("Accept")?.includes("text/event-stream");
  if (wantsStream) {
    const model = env.AI_MODEL || "@cf/qwen/qwen1.5-0.5b-chat";
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      { role: "system", content: PORTFOLIO_CONTEXT },
      { role: "system", content: GUARDRAILS },
      { role: "user", content: message },
    ];
    const start = Date.now();
    try {
      const stream = (await env.AI.run(model as any, {
        messages,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        stream: true,
      } as any)) as unknown as ReadableStream;
      // If binding returns a stream, pipe it directly
      if (stream && typeof (stream as any).getReader === "function") {
        logAi({ requestId, model, durationMs: Date.now() - start, success: true });
        const headers = new Headers();
        headers.set("Content-Type", "text/event-stream; charset=utf-8");
        headers.set("Cache-Control", "no-cache");
        headers.set("X-Request-ID", requestId);
        headers.set("Vary", "Origin");
        if (cors) for (const [k, v] of Object.entries(cors)) headers.set(k, v);
        // @ts-ignore - ReadableStream body is valid for Response
        return new Response(stream as any, { headers });
      }
      // Fallback: if result is not a stream (mock), treat as non-stream
    } catch (e: any) {
      const msg = String(e?.message || "");
      const lower = msg.toLowerCase();
      const isDailyLimit = msg.includes("3036") || lower.includes("account limited") || (e?.status === 429 && lower.includes("account limited"));
      if (isDailyLimit) {
        logAi({ requestId, model, durationMs: Date.now() - start, success: false, errorCode: "DAILY_LIMIT_REACHED" });
        return errorResponse(429, "Daily limit reached", requestId, { corsHeaders: cors });
      }
      logAi({ requestId, model, durationMs: Date.now() - start, success: false, errorCode: "AI_UNAVAILABLE" });
      logError({ requestId, route: "/api/chat", errorCode: "AI_UNAVAILABLE", status: 500 });
      return errorResponse(500, "Internal server error", requestId, { corsHeaders: cors });
    }
    // If we reach here (mock returned non-stream), fall through to aggregated path
  }

  const aiResult = await generateChatResponse(env, message, requestId);

  if (!aiResult.success) {
    if (aiResult.errorCode === "DAILY_LIMIT_REACHED") {
      return errorResponse(429, "Daily limit reached", requestId, { corsHeaders: cors });
    }
    logError({ requestId, route: "/api/chat", errorCode: aiResult.errorCode || "AI_UNAVAILABLE", status: 500 });
    return errorResponse(500, "Internal server error", requestId, { corsHeaders: cors });
  }

  const text = aiResult.message!.slice(0, 1000);
  return successResponse({ message: text }, requestId, cors);
}
