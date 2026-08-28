import type { Env } from "../config.js";
import { AI_CONFIG } from "../config.js";
import { SYSTEM_INSTRUCTIONS, GUARDRAILS } from "../ai/system-instructions.js";
import { PORTFOLIO_CONTEXT } from "../ai/portfolio-context.js";
import { logAi } from "./logging.js";

export type AiErrorCode = "DAILY_LIMIT_REACHED" | "AI_UNAVAILABLE";

export interface AiResult {
  success: boolean;
  message?: string;
  errorCode?: AiErrorCode;
  internalError?: string;
}

export async function generateChatResponse(
  env: Env,
  userMessage: string,
  requestId: string,
): Promise<AiResult> {
  const model = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const start = Date.now();

  // Build messages: static system instructions + context + guardrails before user query
  // Keeps prefix-cache friendly (static first, dynamic last)
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTIONS },
    { role: "system", content: PORTFOLIO_CONTEXT },
    { role: "system", content: GUARDRAILS },
    { role: "user", content: userMessage },
  ];

  try {
    // Workers AI run — model is server-side, client cannot select
    const result: any = await env.AI.run(model as any, {
      messages,
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
    });

    const durationMs = Date.now() - start;

    // Normalize provider response — handle multiple shapes
    let text: string | undefined;
    if (typeof result === "string") {
      text = result;
    } else if (result?.response) {
      text = result.response;
    } else if (result?.result?.response) {
      text = result.result.response;
    } else if (Array.isArray(result?.choices) && result.choices[0]?.message?.content) {
      text = result.choices[0].message.content;
    } else if (typeof result?.generated_text === "string") {
      text = result.generated_text;
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      logAi({ requestId, model, durationMs, success: false, errorCode: "AI_UNAVAILABLE" });
      return { success: false, errorCode: "AI_UNAVAILABLE", internalError: "empty AI response" };
    }

    text = text.trim();
    // Defensive application-level max: truncate to <200 tokens ~ ~800 chars (approx 4 chars/token)
    // We enforce 1000 chars max as safety, plus token budget via max_tokens
    if (text.length > 1000) text = text.slice(0, 1000);

    logAi({ requestId, model, durationMs, success: true });
    return { success: true, message: text };
  } catch (e: any) {
    const durationMs = Date.now() - start;
    const msg = String(e?.message || e || "");
    const lower = msg.toLowerCase();

    // Map Workers AI daily free allocation exhaustion per Cloudflare docs:
    // "Account limited" + "Internal error: 3036" + HTTP 429 = 10,000 neurons/day exhausted (00:00 UTC reset)
    // Do not match arbitrary "limit"/"quota"/"neurons" — use documented codes
    const isDailyLimit =
      msg.includes("3036") ||
      lower.includes("account limited") ||
      (e?.status === 429 && lower.includes("account limited"));

    if (isDailyLimit) {
      logAi({ requestId, model, durationMs, success: false, errorCode: "DAILY_LIMIT_REACHED" });
      return { success: false, errorCode: "DAILY_LIMIT_REACHED", internalError: msg.slice(0, 200) };
    }

    logAi({ requestId, model, durationMs, success: false, errorCode: "AI_UNAVAILABLE" });
    return { success: false, errorCode: "AI_UNAVAILABLE", internalError: msg.slice(0, 200) };
  }
}
