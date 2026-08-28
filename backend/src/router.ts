import type { Env } from "./config.js";
import { getCorsHeaders, corsPreflightResponse, isCorsAllowed } from "./lib/cors.js";
import { getOrCreateRequestId } from "./lib/request-id.js";
import { handleChat } from "./handlers/chat.js";
import { handleContact } from "./handlers/contact.js";
import { errorResponse, jsonResponse } from "./lib/response.js";
import { logError, logRequestCompleted } from "./lib/logging.js";

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const start = Date.now();
  const requestId = getOrCreateRequestId(request);
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") {
    const preflight = corsPreflightResponse(request, env, requestId);
    if (preflight) return preflight;
  }

  const corsHeaders = getCorsHeaders(request, env);
  const origin = request.headers.get("Origin");
  if (origin && !isCorsAllowed(request, env)) {
    logError({ requestId, route: pathname, errorCode: "FORBIDDEN", status: 403 });
    return errorResponse(403, "Forbidden", requestId, { corsHeaders: corsHeaders || undefined });
  }

  let response: Response;
  let status = 200;
  let route = pathname;

  try {
    if (pathname === "/chat" && method === "POST") {
      route = "/chat";
      response = await handleChat(request, env, requestId, corsHeaders);
    } else if (pathname === "/contact" && method === "POST") {
      route = "/contact";
      response = await handleContact(request, env, requestId, corsHeaders);
    } else if (pathname === "/health" && method === "GET") {
      route = "/health";
      response = jsonResponse({ data: { status: "ok" }, meta: { requestId } }, { status: 200, requestId, corsHeaders: corsHeaders || undefined });
    } else if (pathname === "/chat" || pathname === "/contact") {
      response = errorResponse(405, "Method not allowed", requestId, { corsHeaders: corsHeaders || undefined });
    } else {
      response = errorResponse(404, "Not found", requestId, { corsHeaders: corsHeaders || undefined });
    }
    status = response.status;
  } catch (e: any) {
    console.error("unhandled error", e);
    logError({ requestId, route, errorCode: "INTERNAL_ERROR", status: 500 });
    response = errorResponse(500, "Internal server error", requestId, { corsHeaders: corsHeaders || undefined });
    status = 500;
  }

  const durationMs = Date.now() - start;
  logRequestCompleted({ requestId, route, method, status, durationMs, rateLimited: status === 429 });
  if (!response.headers.get("X-Request-ID")) response.headers.set("X-Request-ID", requestId);
  return response;
}
