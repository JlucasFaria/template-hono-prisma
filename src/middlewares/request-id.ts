import type { MiddlewareHandler } from "hono";
import { randomBytes } from "crypto";

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = randomBytes(8).toString("hex");
  c.header("X-Request-ID", requestId);
  await next();
};
