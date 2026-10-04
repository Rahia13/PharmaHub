/**
 * In-memory fixed-window rate limiter, keyed by IP + route. This is fine for
 * a single server process; on multiple instances or serverless, swap the
 * Map for Redis (e.g. Upstash) so limits are shared across instances.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

// Periodically forget old buckets so this doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}, 60_000).unref?.();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }
  return { ok: true, remaining: limit - bucket.count };
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function tooManyRequests(retryAfterMs: number) {
  return new Response(JSON.stringify({ error: "Too many attempts. Please wait and try again." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
    },
  });
}
