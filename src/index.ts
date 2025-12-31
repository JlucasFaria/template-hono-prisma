import { env } from "./config/env";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "./api/user/user-routes";
import authRoutes from "./api/auth/auth-routes";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.use("*", logger());
app.use("*", cors());

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Minha API ...",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => c.text("Servidor rodando com sucesso! 🚀"));

app.onError((err, c) => {
  // Se for uma exceção disparada pelo Hono (como 401 do JWT ou 400 do Zod)
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    );
  }

  // Erros inesperados (crashes reais do servidor)
  console.error(`[Fatal Error]: ${err.stack}`);
  return c.json(
    {
      success: false,
      error: "Erro interno do servidor",
      message: err.message,
    },
    500,
  );
});

app.route("/api/users", userRoutes);
app.route("/api/auth", authRoutes);

const port = env.PORT;
console.log(`\n🚀 Servidor rodando em: http://localhost:${port}`);
console.log(`📚 Swagger UI: http://localhost:${port}/ui`);
console.log(`📄 OpenAPI Doc: http://localhost:${port}/doc\n`);

export default app;
