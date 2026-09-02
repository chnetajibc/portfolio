// Central configuration — single source for model, limits, validation
// All values are changeable without code changes via env vars / wrangler.jsonc

export interface Env {
  AI: Ai;
  // Native Workers Rate Limiting — 5/min, 20/hour, 40/day per IP (native period 60s, hour/day as conservative 60s limits; Cloudflare native only supports 10/60)
  CHAT_RATE_LIMIT: RateLimit;
  CHAT_RATE_LIMIT_HOUR: RateLimit;
  CHAT_RATE_LIMIT_DAY: RateLimit;
  CONTACT_RATE_LIMIT: RateLimit;
  CONTACT_RATE_LIMIT_HOUR: RateLimit;
  CONTACT_RATE_LIMIT_DAY: RateLimit;
  // Cloudflare Email binding — verified destination, fixed sender
  EMAIL: SendEmail;
  // Config vars
  ALLOWED_ORIGIN: string;
  AI_MODEL: string;
  // Optional: for testing / local dev
  ENVIRONMENT?: string;
}

// Fallback constants if env not set (local dev)
export const DEFAULTS = {
  ALLOWED_ORIGIN: "http://localhost:3000",
  AI_MODEL: "@cf/meta/llama-3.2-b-instruct",
} as const;

// Rate limit constants — native binding only (5 per 60s for /api/chat)
export const CHAT_RATE_LIMIT = {
  LIMIT: 5,
  PERIOD_SEC: 60,
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

export function getEnvConfig(env: Env) {
  return {
    allowedOrigin: env.ALLOWED_ORIGIN || DEFAULTS.ALLOWED_ORIGIN,
    aiModel: env.AI_MODEL || DEFAULTS.AI_MODEL,
  };
}
