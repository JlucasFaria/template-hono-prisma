// In-memory IP-based rate limiter middleware
import type { MiddlewareHandler } from "hono";

// Simple in-memory rate limiting store: maps IP → { count, resetAt }
const requests = new Map<string, { count: number; resetAt: number }>();

// NOTE: This is an in-memory store — not suitable for distributed/multi-instance deployments.
// For production at scale, replace with a shared store (e.g. Redis).
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of requests) {
      if (now > record.resetAt) {
        requests.delete(ip);
      }
    }
  },
  5 * 60 * 1000, // run every 5 minutes
);

export const rateLimitMiddleware = (
  maxRequests = 100,
  windowMs = 60000, // 1 minute
): MiddlewareHandler => {
  return async (c, next) => {
    // NOTE: X-Forwarded-For can be spoofed by clients. In production, ensure
    // your reverse proxy (nginx, Cloudflare) sets this header and strips
    // any client-provided values before they reach this middleware.
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("cf-connecting-ip") ||
      "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (record.count >= maxRequests) {
      return c.json(
        {
          success: false,
          error: "Too many requests",
          message: `Limit of ${maxRequests} requests per minute exceeded`,
        },
        429,
      );
    }

    record.count++;
    await next();
  };
};
