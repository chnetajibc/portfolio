// Central configuration — SINGLE SOURCE OF TRUTH for all backend config
// All tunable values MUST be defined here exactly once.
// wrangler.jsonc, .dev.vars.example, and worker-configuration.d.ts are
// projections of this file — keep them synced when changing values here.

export interface Env {
  AI: Ai;
  // Native Workers Rate Limiting — 5/min, 20/hour, 40/day per IP
  // Cloudflare native only supports period 10/60, so hour/day are modeled as 60s windows
  CHAT_RATE_LIMIT: RateLimit;
  CHAT_RATE_LIMIT_HOUR: RateLimit;
  CHAT_RATE_LIMIT_DAY: RateLimit;
  CONTACT_RATE_LIMIT: RateLimit;
  CONTACT_RATE_LIMIT_HOUR: RateLimit;
  CONTACT_RATE_LIMIT_DAY: RateLimit;
  // Cloudflare Email binding — verified destination, fixed sender
  EMAIL: SendEmail;
  // Config vars (overridden via wrangler.jsonc vars / secrets / .dev.vars)
  ALLOWED_ORIGIN: string;
  AI_MODEL: string;
  // Optional: for testing / local dev
  ENVIRONMENT?: string;
}

// Canonical origins — single source for CORS allowed origins
export const ORIGINS = {
  PROD: "https://chnetaji.com",
  DEV: "http://localhost:3000",
} as const;

// Fallback defaults if env not set
// ALLOWED_ORIGIN defaults to ORIGINS.DEV for local dev; production fallback is ORIGINS.PROD when ENVIRONMENT !== "development"
export const DEFAULTS = {
  ALLOWED_ORIGIN: ORIGINS.DEV,
  AI_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
  CONTACT_TO: "chnetajibc@gmail.com",
  CONTACT_FROM: "noreply@chnetaji.com",
} as const;

// Contact email — fixed destination/sender, never derived from request
export const CONTACT_CONFIG = {
  TO: DEFAULTS.CONTACT_TO,
  FROM: DEFAULTS.CONTACT_FROM,
} as const;

// Rate limit definitions — canonical limits for wrangler.jsonc `ratelimits`
// Sync: if you change limit/period/name/namespace_id here, update wrangler.jsonc
export const RATE_LIMITS = {
  CHAT: {
    MINUTE: { name: "CHAT_RATE_LIMIT", namespace_id: "1", limit: 5, period: 60 },
    HOUR: { name: "CHAT_RATE_LIMIT_HOUR", namespace_id: "2", limit: 20, period: 60 },
    DAY: { name: "CHAT_RATE_LIMIT_DAY", namespace_id: "3", limit: 40, period: 60 },
  },
  CONTACT: {
    MINUTE: { name: "CONTACT_RATE_LIMIT", namespace_id: "4", limit: 5, period: 60 },
    HOUR: { name: "CONTACT_RATE_LIMIT_HOUR", namespace_id: "5", limit: 20, period: 60 },
    DAY: { name: "CONTACT_RATE_LIMIT_DAY", namespace_id: "6", limit: 40, period: 60 },
  },
} as const;

// Back-compat: existing imports of CHAT_RATE_LIMIT (tests) — maps to canonical
export const CHAT_RATE_LIMIT = {
  LIMIT: RATE_LIMITS.CHAT.MINUTE.limit,
  PERIOD_SEC: RATE_LIMITS.CHAT.MINUTE.period,
} as const;

// Validation limits
export const VALIDATION = {
  CHAT: {
    MAX_MESSAGE_LENGTH: 2000,
    MIN_MESSAGE_LENGTH: 1,
    MAX_BODY_BYTES: 8 * 1024, // 8KB bounded
  },
  CONTACT: {
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 1,
    MAX_EMAIL_LENGTH: 254,
    MAX_MESSAGE_LENGTH: 5000,
    MIN_MESSAGE_LENGTH: 1,
    MAX_BODY_BYTES: 16 * 1024,
    HONEYPOT_FIELD: "website", // honeypot
  },
} as const;

// AI config — keep token budget <200
export const AI_CONFIG = {
  MAX_TOKENS: 180,
  // Do not expose temperature etc. to client — server-side only
  TEMPERATURE: 0.7,
} as const;

// CORS — canonical header values
export const CORS_CONFIG = {
  ALLOW_METHODS: "GET, POST, OPTIONS",
  ALLOW_HEADERS: "Content-Type, X-Request-ID",
  MAX_AGE: "86400",
} as const;

export function getEnvConfig(env: Env) {
  // Production uses ORIGINS.PROD when no explicit ALLOWED_ORIGIN and not in development
  const fallbackOrigin = env.ENVIRONMENT === "development" ? ORIGINS.DEV : ORIGINS.PROD;
  return {
    allowedOrigin: env.ALLOWED_ORIGIN || fallbackOrigin,
    aiModel: env.AI_MODEL || DEFAULTS.AI_MODEL,
    contactTo: DEFAULTS.CONTACT_TO,
    contactFrom: DEFAULTS.CONTACT_FROM,
  };
}

// Helpers for AI — single message building and error classification
export function buildAiMessages(userMessage: string): Array<{ role: string; content: string }> {
  // Imported lazily to avoid circular deps — caller should supply system strings
  // This helper is re-exported from lib/ai.ts for convenience; keep shape here for reference
  return [{ role: "user", content: userMessage }];
}

export function isDailyLimitError(err: { message?: string; status?: number } | unknown): boolean {
  const e = err as { message?: string; status?: number };
  const msg = String(e?.message || err || "");
  const lower = msg.toLowerCase();
  return msg.includes("3036") || lower.includes("account limited") || (e?.status === 429 && lower.includes("account limited"));
}
