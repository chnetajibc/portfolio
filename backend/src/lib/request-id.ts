// Request ID — generate or validate client-provided

export function getOrCreateRequestId(request: Request): string {
  const provided = request.headers.get("X-Request-ID");
  if (provided && isValidRequestId(provided)) return provided;
  // Generate UUID v4 via crypto.randomUUID
  return crypto.randomUUID();
}

function isValidRequestId(id: string): boolean {
  // UUID v4 format, bounded length 1-64, alphanumeric + hyphen
  if (id.length < 8 || id.length > 64) return false;
  return /^[a-zA-Z0-9-_]+$/.test(id);
}
