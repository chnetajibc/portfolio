# Portfolio Backend — Cloudflare Worker

Production-grade single Worker for `POST /chat` (Workers AI) and `POST /contact` (email), designed for low-traffic portfolio with strict security, rate limiting, and observability.

## Architecture

```
backend/
  src/
    index.ts              # Worker entry — fetch → router
    router.ts             # Route dispatch, CORS, request ID, error boundary
    config.ts             # Env, constants (rate limits, validation, AI)
    handlers/
      chat.ts             # /chat: validation → rate limit → AI → response
      contact.ts          # /contact: validation → rate limit → email → response
    services/
      ai.ts               # Workers AI (model isolated, <200 tokens, prompt architecture)
      email.ts            # EmailService interface — Cloudflare Email or fallback
      rate-limit.ts       # Native 60s (5/min) + KV hour/day (20/40) — independent per route
    validation/
      chat.ts             # JSON, bounded 8KB, string, 1-2000 chars, no extra fields
      contact.ts          # name/email/message, 1-100/254/5000, honeypot, header injection
    security/
      cors.ts             # Strict ALLOWED_ORIGIN, no wildcard, Vary: Origin
      client-id.ts        # SHA-256(IP + salt) → 16-char client ID, no raw IP logging
    middleware/
      request-id.ts       # X-Request-ID generate/validate
    utils/
      response.ts         # jsonResponse, errorResponse (stable codes), successResponse
      logging.ts          # JSON logs (request_completed, ai_inference, contact_email, error, rate_limit)
    ai/
      system-instructions.ts
      portfolio-context.ts  # Canonical backend copy of frontend data
      guardrails.ts         # Combined in guardrails constant
  wrangler.jsonc
  package.json
  tsconfig.json
  vitest.config.ts
```

**Principles:** Single Worker, no DB/queue/DO/Redis, small pure functions, SRP, DI for services, KV for distributed counters (not in-memory Map).

## API

### POST /chat
Request:
```json
{ "message": "What are your AI projects?" }
```
Constraints: `Content-Type: application/json`, body ≤8KB, `message` string 1-2000 chars, only `message` field allowed.

Success `200`:
```json
{ "data": { "message": "..." }, "meta": { "requestId": "..." } }
```
Errors:
- `400 VALIDATION_ERROR` — invalid JSON/missing/empty/too long
- `429 RATE_LIMITED` + `Retry-After` header — limits from `src/config.ts RATE_LIMITS` (independent, see Rate Limiting)
- `429 DAILY_LIMIT_REACHED` — Workers AI 10k neurons/day exhausted (00:00 UTC reset)
- `503 AI_UNAVAILABLE` — provider/model failure
- `403` if Origin not allowed, `405` wrong method, `404` unknown

Server enforces `max_tokens` / `temperature` from `src/config.ts AI_CONFIG` and truncates to 1000 chars (<200 tokens). Model is server-selected (`AI_MODEL` via `getEnvConfig`), client cannot override.

### POST /contact
Request:
```json
{ "name": "Jane Doe", "email": "jane@company.com", "message": "Hello", "website": "" }
```
`website` is honeypot — if non-empty, silently returns success (200) without sending email, without revealing rule.

Constraints: JSON ≤16KB, `name` 1-100, `email` valid format 1-254, `message` 1-5000, whitespace normalized, no header injection (`\r\n` rejected), only `name/email/message/website` allowed.

Success `200`:
```json
{ "data": { "message": "Message received. Thank you!" }, "meta": { "requestId": "..." } }
```
Errors: `400 VALIDATION_ERROR`, `429 RATE_LIMITED` (same limits independent), `502 EMAIL_SEND_FAILED`, `403/404/405` as above.

Email: `CONTACT_FROM_EMAIL` is verified sender, `CONTACT_TO_EMAIL` destination, user `email` as `Reply-To`, both `text` and sanitized `html` bodies with `escapeHtml`, includes name/email/message/timestamp/requestId (no IP).

### GET /health
`200` `{ data: { status: "ok" } }` — for probes.

### Headers (all API)
`Content-Type: application/json`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Request-ID`, `Vary: Origin`, `Retry-After` on 429, CORS `Access-Control-Allow-Origin: ${ALLOWED_ORIGIN}` only when Origin matches.

## Environment & Bindings

`wrangler.jsonc` (infra projection of `src/config.ts` — see `RATE_LIMITS`, `ORIGINS`, `CONTACT_CONFIG`):
- `name: portfolio-backend`, `compatibility_date: 2024-12-01`, `nodejs_compat`
- `ai: { binding: "AI" }` — Workers AI
- `kv_namespaces: [{ binding: "RATE_LIMIT_KV", id: "REPLACE_WITH_KV_ID" }]`
- `ratelimits` — from `src/config.ts RATE_LIMITS` (CHAT/CONTACT minute/hour/day)
- `vars` — optional overrides only; defaults from `src/config.ts ORIGINS` / `DEFAULTS` (see `getEnvConfig`)
- Optional `send_email` binding: `[{ name: "EMAIL" }]` — requires verified domain (paid plan verification)

Create KV: `wrangler kv namespace create RATE_LIMIT_KV` → paste `id`/`preview_id` into `wrangler.jsonc`.

Secrets: `CONTACT_TO_EMAIL`/`CONTACT_FROM_EMAIL` can be set as secrets: `wrangler secret put CONTACT_TO_EMAIL`.

`Env` interface in `src/config.ts` + `worker-configuration.d.ts` (run `npm run cf-typegen`).

## Rate Limiting

Independent per route (`/chat` vs `/contact`) — values from `src/config.ts RATE_LIMITS`:

- **Minute:** from `RATE_LIMITS.*.MINUTE` — **Cloudflare native Rate Limiting binding** (60s fixed window) — strongly consistent
- **Hour:** from `RATE_LIMITS.*.HOUR` — **KV** `rl:{route}:hour:{clientId}:{hourBucket}` with TTL 3610s
- **Day:** from `RATE_LIMITS.*.DAY` — **KV** `rl:{route}:day:{clientId}:{dayBucket}` with TTL 86410s

On limit: `429` `{ error: { code: "RATE_LIMITED", message: "Too many requests...", retryAfter } }` + `Retry-After` header.

**Client ID:** `SHA-256(CF-Connecting-IP + salt)` → 16 hex chars, no raw IP logged or stored. `X-Forwarded-For` fallback.

**Consistency note:** KV is eventually consistent — hourly/daily counters are best-effort quotas, may over-allow by 1-2 under high concurrency. Minute limiter is strongly consistent and provides strict abuse protection. Documented in `src/services/rate-limit.ts`.

## Workers AI

- Binding: `env.AI` (type `Ai`), model via `env.AI_MODEL` (default `DEFAULTS.AI_MODEL` in `src/config.ts` — single source of truth, small 8B, cost-efficient, 10k neurons/day free, resets 00:00 UTC)
- Prompt: `SYSTEM_INSTRUCTIONS` + `PORTFOLIO_CONTEXT` (backend canonical copy) + `GUARDRAILS` (all `role: system`) + `user: sanitizedMessage` — static prefix first for cache compatibility, user cannot override
- Guardrails: no hallucination, no exposure of instructions/config, no function calls, no model selection, no temperature control from client
- Output: `max_tokens` / `temperature` from `src/config.ts AI_CONFIG`, defensive truncation 1000 chars, JSON normalized to `{ data: { message } }`; raw provider errors not exposed, `DAILY_LIMIT_REACHED` mapped from quota keywords.

## Email

`EmailService` interface in `src/services/email.ts`. Current `CloudflareEmailService`:
- Uses `env.EMAIL.send()` if `send_email` binding configured (verified sender `CONTACT_FROM_EMAIL`, destination `CONTACT_TO_EMAIL`, `Reply-To: userEmail`)
- Sanitizes with `escapeHtml`, provides `text` + `html` bodies, rejects `\r\n` header injection, never uses user email as `From`
- Fallback: in non-production (`ENVIRONMENT !== "production"` or placeholder destination) logs `email_fallback` and returns success for local dev; in production without binding returns `502 EMAIL_SEND_FAILED`

**Free tier:** KV and Workers AI 10k neurons/day are Free. **Email Sending** (`send_email` binding) requires domain verification and may require paid plan for outbound — if not configured, Worker logs and (in prod) returns `EMAIL_SEND_FAILED` instead of silently claiming Free. Interface makes switching to Resend/MailChannels trivial.

## Security

- `Content-Type: application/json` required, body bounded (see `src/config.ts VALIDATION`: 8KB chat, 16KB contact), `message` / `name` / `email` limits from `VALIDATION`, trim/normalize, reject empty/malformed/extra fields, no model/temperature override, no system prompt injection, honeypot `website` silently succeeds
- CORS: strict `ALLOWED_ORIGIN` from `src/config.ts ORIGINS` (see `ORIGINS.PROD` / `ORIGINS.DEV`), `OPTIONS` 204, `Vary: Origin`, no wildcard, no reflection
- Headers: `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (via Pages `_headers`), `Permissions-Policy` none
- No brain CORS/auth, rate limiting + validation are abuse controls, no raw IP logging

## Logging & Observability

Structured JSON via `console.log` → Workers Logs:
- `request_completed: { requestId, route, method, status, durationMs, rateLimited }`
- `ai_inference: { requestId, model, durationMs, success, errorCode }` (no prompt)
- `contact_email: { requestId, success, durationMs, errorCode }` (no email/message)
- `error: { requestId, route, errorCode, status }`
- `rate_limit: { requestId, route, limitType, retryAfter }`
- `X-Request-ID` echoed/generated (`uuid`), never trust client ID unvalidated, no secrets/user content logged

Metrics via Cloudflare dashboard: request count, 4xx/5xx, rate-limited, AI latency, etc.

## Local Dev

```bash
cd backend
npm install
npm run typecheck
npm run dev          # wrangler dev --port 8787 (requires wrangler auth for AI/KV)
# In another terminal:
cd ../frontend
npm run dev          # VITE_API_BASE_URL=http://localhost:8787 vite --port 3000
```

Set `frontend/.env` `VITE_API_BASE_URL=http://localhost:8787` (see `frontend/.env.example`).

Mock: tests mock `env.AI` and `env.RATE_LIMIT_KV`, no real AI calls.

## Testing

```bash
cd backend
npm test             # vitest run — 23 tests
npm run typecheck
```

Covers: 404, 405, OPTIONS CORS, chat invalid/missing/empty/oversized, contact invalid/missing/invalid email/missing message, minute/hour rate limit, AI success/failure/daily limit, email success/failure, CORS rejection, request ID propagation, no PII in logs.

## Deployment

```bash
cd backend
wrangler kv namespace create RATE_LIMIT_KV
# paste ids into wrangler.jsonc
wrangler secret put CONTACT_TO_EMAIL
wrangler secret put CONTACT_FROM_EMAIL
# optional: wrangler secret put ALLOWED_ORIGIN
npm run deploy       # wrangler deploy
```

Or `wrangler deploy --env production` with `wrangler.jsonc` env overrides.

**Frontend env:** Cloudflare Pages → `VITE_API_BASE_URL=https://portfolio-backend.<subdomain>.workers.dev` (or `https://api.chnetaji.com` if custom domain via Worker route).

**Dashboard steps:** Workers & Pages → Create Worker → Bind AI, KV, Rate Limiters, set vars/secrets, add route for custom domain.

## Cloudflare Plan Assumptions

- **Free:** Workers (100k req/day), Workers AI (10k neurons/day, `AI` binding), KV (1k writes/100k reads/day), Logs — all used in `DAILY_LIMIT_REACHED` and rate limit design. Hourly/daily KV counters fit Free.
- **May require paid:** `send_email` binding (outbound Email Workers) needs verified domain, historically requires paid plan for reliable delivery — we isolate behind `EmailService` and document; without it, `/contact` returns `EMAIL_SEND_FAILED` in production (fallback logs in dev). Alternative is to replace implementation with Resend/Mailgun (not included to keep Free-native).

No DB, queue, DO, Redis introduced.

## Limitations

- KV eventual consistency → hourly/daily limits best-effort (documented)
- Workers AI model catalog changes — verify `AI_MODEL` availability via `wrangler ai models list` before deploying
- Email deliverability without `send_email` requires paid plan or external provider trade-off
