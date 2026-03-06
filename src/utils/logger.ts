// Minimal structured JSON logger middleware
// Replaces Hono's plain-text logger() with machine-readable output that includes
// requestId, making log correlation across services and error reports possible.
import type { MiddlewareHandler } from "hono";

export const structuredLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  const requestId = c.get("requestId" as never) as string | undefined;

  console.log(
    JSON.stringify({
      requestId,
      method: c.req.method,
      path: c.req.path,
      statusCode: c.res.status,
      duration,
      timestamp: new Date().toISOString(),
    }),
  );
};
