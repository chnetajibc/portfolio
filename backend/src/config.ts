// Central configuration — single source for model, limits, validation
// All values are changeable without code changes via env vars / wrangler.jsonc

export interface Env {
  AI: Ai;
  RATE_LIMIT_KV: KVNamespace;
  // Native rate limiters (60s window, 5 req)
  CHAT_MINUTE_LIMITER: RateLimit;
  CONTACT_MINUTE_LIMITER: RateLimit;
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
  AI_MODEL: "@cf/qwen/qwen1.5-0.5b-chat",
} as const;

// Rate limit constants — independent for chat and contact
export const RATE_LIMITS = {
  CHAT: {
    MINUTE: { limit: 5, windowSec: 60 },
    HOUR: { limit: 20, windowSec: 3600 },
    DAY: { limit: 40, windowSec: 86400 },
  },
  CONTACT: {
    MINUTE: { limit: 5, windowSec: 60 },
    HOUR: { limit: 20, windowSec: 3600 },
    DAY: { limit: 40, windowSec: 86400 },
  },
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
