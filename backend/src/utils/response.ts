import type { Env } from "../config.js";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "DAILY_LIMIT_REACHED"
  | "AI_UNAVAILABLE"
  | "EMAIL_SEND_FAILED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ErrorCode;
  message: string;
  requestId?: string;
  retryAfter?: number;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  meta: { requestId: string };
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit & { requestId?: string; corsHeaders?: Record<string, string> } = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  if (init.requestId) headers.set("X-Request-ID", init.requestId);
  // Vary for CORS
  headers.set("Vary", "Origin");
  if (init.corsHeaders) {
    for (const [k, v] of Object.entries(init.corsHeaders)) headers.set(k, v);
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  requestId: string,
  opts: { retryAfter?: number; details?: unknown; corsHeaders?: Record<string, string> } = {},
): Response {
  const headers: Record<string, string> = {};
  if (opts.retryAfter !== undefined) headers["Retry-After"] = String(opts.retryAfter);
  return jsonResponse(
    {
      error: {
        code,
        message,
        requestId,
        ...(opts.retryAfter !== undefined ? { retryAfter: opts.retryAfter } : {}),
        ...(opts.details ? { details: opts.details } : {}),
      },
    },
    { status, requestId, corsHeaders: opts.corsHeaders },
  );
}

export function successResponse<T>(data: T, requestId: string, corsHeaders?: Record<string, string>, status = 200): Response {
  return jsonResponse({ data, meta: { requestId } }, { status, requestId, corsHeaders });
}
