/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for single-instance deployments. For multi-instance / edge
 * deployments, swap the in-memory Map for Redis (e.g. @upstash/ratelimit).
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
 *   const result  = limiter.check(ip);
 *   if (!result.allowed) return NextResponse.json(..., { status: 429 });
 */

interface RateLimiterOptions {
  /** Time window in milliseconds (default 60 000 = 1 min) */
  windowMs?: number;
  /** Max requests allowed per window per key (default 5) */
  max?: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Requests remaining in the current window */
  remaining: number;
  /** Unix ms timestamp when the window resets */
  resetAt: number;
}

interface TokenBucket {
  timestamps: number[];
}

export function createRateLimiter(opts: RateLimiterOptions = {}) {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 5;
  const store = new Map<string, TokenBucket>();

  // Periodic cleanup to prevent memory leaks (every 5 minutes)
  const CLEANUP_INTERVAL = 5 * 60_000;
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, bucket] of Array.from(store)) {
      const valid = bucket.timestamps.filter((t: number) => now - t < windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        bucket.timestamps = valid;
      }
    }
  }

  function check(key: string): RateLimitResult {
    cleanup();

    const now = Date.now();
    const bucket = store.get(key) ?? { timestamps: [] };

    // Keep only timestamps within the current window
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

    if (bucket.timestamps.length >= max) {
      const oldest = bucket.timestamps[0]!;
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldest + windowMs,
      };
    }

    bucket.timestamps.push(now);
    store.set(key, bucket);

    return {
      allowed: true,
      remaining: max - bucket.timestamps.length,
      resetAt: bucket.timestamps[0]! + windowMs,
    };
  }

  return { check };
}
