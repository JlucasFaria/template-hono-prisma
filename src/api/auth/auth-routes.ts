import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { env } from "../../config/env";
import { UserService } from "../user/user-service";
import { loginSchema, loginResponseSchema } from "../user/user-schema";

const authRoutes = new OpenAPIHono();

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: loginResponseSchema } },
      description: "Token gerado com sucesso",
    },
    401: { description: "Usuário não autorizado" },
  },
});

authRoutes.openapi(loginRoute, async (c) => {
  const { email } = c.req.valid("json");
  const userService = new UserService();

  const user = await userService.findByEmail(email);

  if (!user) {
    return c.json({ error: "E-mail não encontrado" }, 401);
  }

  // Payload do token (expira em 1 hora)
  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = await sign(payload, env.JWT_SECRET);

  return c.json({ token }, 200);
});

export default authRoutes;
