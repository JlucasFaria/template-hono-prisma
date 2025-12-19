import { Hono } from "hono";
import userRoutes from "./routes/user-routes";

const app = new Hono();

app.get("/", (c) => c.text("Servidor rodando com sucesso! 🚀"));

app.route("/api/users", userRoutes);

export default app;
