import { getEnvConfig, type Env } from "../config.js";

// CORS — never reflect arbitrary Origin, only configured ALLOWED_ORIGIN
export function getCorsHeaders(request: Request, env: Env): Record<string, string> | null {
  const origin = request.headers.get("Origin");
  const { allowedOrigin } = getEnvConfig(env);

  // If no Origin header (e.g., curl, same-origin), don't add CORS; browser will handle
  if (!origin) return null;

  // Only allow configured origin — strict, not dynamic reflection
  // For local dev, ALLOWED_ORIGIN should be http://localhost:3000
  if (origin !== allowedOrigin) return null;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Request-ID",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function isCorsAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser or same-origin, allow
  const { allowedOrigin } = getEnvConfig(env);
  return origin === allowedOrigin;
}

export function corsPreflightResponse(request: Request, env: Env, requestId: string): Response | null {
  if (request.method !== "OPTIONS") return null;
  const corsHeaders = getCorsHeaders(request, env);
  if (!corsHeaders) {
    // Origin not allowed — don't expose preflight
    return new Response(null, { status: 204, headers: { "Vary": "Origin", "X-Request-ID": requestId } });
  }
  return new Response(null, { status: 204, headers: { ...corsHeaders, "X-Request-ID": requestId } });
}
