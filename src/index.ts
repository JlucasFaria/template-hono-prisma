// Configuração principal da aplicação Hono com OpenAPI
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

const app = new OpenAPIHono();

// Configura autenticação JWT Bearer para OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Middlewares globais (ordem importa!)
app.use("*", requestIdMiddleware); // Primeiro: adiciona ID à requisição
app.use("*", logger());
app.use("*", cors());
app.use("/api/*", rateLimitMiddleware(100, 60000)); // Rate limit apenas nas rotas

// Documentação OpenAPI
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Minha API ...",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => c.text("Servidor rodando com sucesso! 🚀"));

// Tratamento global de erros
app.onError(errorHandler);

app.route("/api/users", userRoutes);
app.route("/api/auth", authRoutes);

const port = env.PORT;
console.log(`\n🚀 Servidor rodando em: http://localhost:${port}`);
console.log(`📚 Swagger UI: http://localhost:${port}/ui`);
console.log(`📄 OpenAPI Doc: http://localhost:${port}/doc\n`);

export default app;
