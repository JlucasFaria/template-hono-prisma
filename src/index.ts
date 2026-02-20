// Main application setup: middleware registration, routes, and OpenAPI config
import { env } from "./config/env";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "./api/user/user-routes";
import authRoutes from "./api/auth/auth-routes";
import { errorHandler } from "./middlewares/error-handler";
import { requestIdMiddleware } from "./middlewares/request-id";
import { rateLimitMiddleware } from "./middlewares/rate-limit";
import prisma from "./db/client";

const app = new OpenAPIHono();

// Register JWT Bearer auth scheme for OpenAPI/Swagger
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Global middlewares (order matters!)
app.use("*", requestIdMiddleware); // First: attach request ID
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use("/api/*", rateLimitMiddleware(100, 60000)); // Rate limit only on API routes

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono Prisma API",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      200,
    );
  } catch {
    return c.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      503,
    );
  }
});

app.get("/", (c) => c.text("Server is running!"));

// Global error handler
app.onError(errorHandler);

app.route("/api/users", userRoutes);
app.route("/api/auth", authRoutes);

const port = env.PORT;
console.log(`\n🚀 Server running at: http://localhost:${port}`);
console.log(`📚 Swagger UI:        http://localhost:${port}/ui`);
console.log(`📄 OpenAPI doc:       http://localhost:${port}/doc\n`);

export default app;
