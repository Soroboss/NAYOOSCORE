type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

function pruneBuckets(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
    if (buckets.size <= MAX_BUCKETS * 0.8) break;
  }
}

export type RateLimitResult = {
  success: boolean;
  retryAfter?: number;
  remaining: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  pruneBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export const RATE_LIMITS = {
  auth: { limit: 25, windowMs: 15 * 60 * 1000 },
  forgotPassword: { limit: 8, windowMs: 60 * 60 * 1000 },
  apiExport: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;

export function rateLimitErrorMessage(retryAfter?: number): string {
  if (retryAfter && retryAfter < 60) {
    return `Trop de tentatives. Réessayez dans ${retryAfter} seconde(s).`;
  }
  if (retryAfter) {
    const minutes = Math.ceil(retryAfter / 60);
    return `Trop de tentatives. Réessayez dans ${minutes} minute(s).`;
  }
  return "Trop de tentatives. Réessayez plus tard.";
}
