import "./config/env";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import userRoutes from "./routes/user-routes";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

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
