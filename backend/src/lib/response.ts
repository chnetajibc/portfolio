// Simple stable error responses per spec — no stack, no internal codes in body
// Body is { error: "Message" } or { data: ..., meta: { requestId } } for success

export function jsonResponse(
  body: unknown,
  init: ResponseInit & { requestId?: string; corsHeaders?: Record<string, string> } = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  if (init.requestId) headers.set("X-Request-ID", init.requestId);
  headers.set("Vary", "Origin");
  if (init.corsHeaders) for (const [k, v] of Object.entries(init.corsHeaders)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(
  status: number,
  message: string,
  requestId: string,
  opts: { retryAfter?: number; corsHeaders?: Record<string, string> } = {},
): Response {
  const headers: Record<string, string> = {};
  if (opts.retryAfter !== undefined) headers["Retry-After"] = String(opts.retryAfter);
  return jsonResponse({ error: message }, { status, requestId, corsHeaders: opts.corsHeaders, headers });
}

export function successResponse<T>(data: T, requestId: string, corsHeaders?: Record<string, string>, status = 200): Response {
  return jsonResponse({ data, meta: { requestId } }, { status, requestId, corsHeaders });
}
