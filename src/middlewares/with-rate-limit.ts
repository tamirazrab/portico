import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import type { MiddlewareFactory } from "@/middlewares/middleware-factory";

type RateLimitBucket = {
  count: number;
  resetAtMs: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitBuckets: Map<string, RateLimitBucket> | undefined;
}

function getBuckets(): Map<string, RateLimitBucket> {
  if (!globalThis.__rateLimitBuckets) {
    globalThis.__rateLimitBuckets = new Map();
  }
  return globalThis.__rateLimitBuckets;
}

function getClientIp(req: NextRequest): string {
  // Prefer platform-provided IP if present.
  const direct = (req as unknown as { ip?: string }).ip;
  if (direct) return direct;
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0]?.trim() || "unknown";
}

function limitForPath(pathname: string): { limit: number; windowMs: number } {
  if (pathname.startsWith("/api/workflows/")) {
    return { limit: 60, windowMs: 60_000 }; // 60/min per IP
  }
  if (pathname.startsWith("/api/trpc")) {
    return { limit: 300, windowMs: 60_000 }; // 300/min per IP
  }
  return { limit: 600, windowMs: 60_000 };
}

export const withRateLimit: MiddlewareFactory =
  (next) => async (req: NextRequest, evt: NextFetchEvent) => {
    const { pathname } = req.nextUrl;
    const { limit, windowMs } = limitForPath(pathname);
    const ip = getClientIp(req);
    const key = `${pathname.startsWith("/api/workflows/") ? "webhook" : "trpc"}:${ip}`;

    const now = Date.now();
    const buckets = getBuckets();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAtMs <= now) {
      buckets.set(key, { count: 1, resetAtMs: now + windowMs });
      return next(req, evt);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((bucket.resetAtMs - now) / 1000)),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    buckets.set(key, bucket);
    return next(req, evt);
  };
