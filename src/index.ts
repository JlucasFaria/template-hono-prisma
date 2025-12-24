import "./config/env";
import { OpenAPIHono } from "@hono/zod-openapi"; //
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "./routes/user-routes";

const app = new OpenAPIHono();

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

app.onError((err, c) => {
  console.error(`[Global Error]: ${err.message}`);
  return c.json(
    {
      error: "Erro interno do servidor",
      message: err.message,
    },
    500,
  );
});

app.get("/", (c) => c.text("Servidor rodando com sucesso! 🚀"));

app.route("/api/users", userRoutes);

export default app;
