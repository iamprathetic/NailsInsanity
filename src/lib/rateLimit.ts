// Best-effort in-memory rate limiter, keyed per Vercel serverless instance.
// This does NOT enforce a hard global limit (each instance has its own
// memory, and Vercel can run several concurrently), but it meaningfully
// raises the bar against naive scripted abuse from a single source without
// requiring an external store like Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let calls = 0;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistically sweep expired buckets so the map doesn't grow
  // unbounded on long-lived instances.
  if (++calls % 200 === 0) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
