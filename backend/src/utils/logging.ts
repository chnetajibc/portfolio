// Structured JSON logging for Workers Logs
// Do NOT log PII, raw IP, email, chat messages, or prompts

export type LogEvent =
  | "request_completed"
  | "ai_inference"
  | "contact_email"
  | "error"
  | "rate_limit";

export interface LogBase {
  event: LogEvent;
  requestId: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
}

export function log(event: LogEvent, data: Record<string, unknown>) {
  // Use console.log which maps to Workers Logs (JSON)
  console.log(JSON.stringify({ event, ...data }));
}

export function logRequestCompleted(opts: {
  requestId: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  rateLimited?: boolean;
}) {
  log("request_completed", opts);
}

export function logAi(opts: {
  requestId: string;
  model: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
}) {
  log("ai_inference", opts);
}

export function logContact(opts: {
  requestId: string;
  success: boolean;
  durationMs: number;
  errorCode?: string;
}) {
  log("contact_email", opts);
}

export function logError(opts: {
  requestId: string;
  route: string;
  errorCode: string;
  status: number;
  details?: string;
}) {
  log("error", opts);
}

export function logRateLimit(opts: {
  requestId: string;
  route: string;
  limitType: "minute" | "hour" | "day";
  retryAfter: number;
}) {
  log("rate_limit", opts);
}
