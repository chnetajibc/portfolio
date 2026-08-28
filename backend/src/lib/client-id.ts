// Privacy-conscious client identifier
// Do NOT log raw IP. Hash IP + salt to non-reversible ID for rate limiting.
// Works across isolates via KV, not in-memory Map.

const SALT = "portfolio-client-id-v1"; // static salt — not secret, just prevents trivial reversal

export async function getClientId(request: Request): Promise<string> {
  // Prefer CF-Connecting-IP (Cloudflare) else fallback to x-forwarded-for or remote addr
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    request.headers.get("X-Real-IP") ||
    "unknown";

  // For local dev, ip may be unknown — use a stable fallback per request
  const raw = `${ip}:${SALT}`;

  // SHA-256 hash — non-reversible, consistent per IP
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  // Shorten to 16 chars for KV key brevity (still 64 bits)
  return hashHex.slice(0, 16);
}

// For testing: allow injection of client id via header (only in dev, not for security)
// In production, do not trust X-Client-ID header — always derive from IP
