// src/middlewares/rate-limit.ts
import type { MiddlewareHandler } from "hono";

// Implementação simples de rate limiting em memória
const requests = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = (
  maxRequests = 100,
  windowMs = 60000, // 1 minuto
): MiddlewareHandler => {
  return async (c, next) => {
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
          error: "Muitas requisições",
          message: `Limite de ${maxRequests} requisições por minuto excedido`,
        },
        429,
      );
    }

    record.count++;
    await next();
  };
};
