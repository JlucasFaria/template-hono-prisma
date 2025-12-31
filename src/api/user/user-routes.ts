// Rotas de usuários
import { UserService } from "./user-service";
import { createUserSchema, UserSchema } from "./user-schema";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import type { Context, Next } from "hono";

type Variables = {
  jwtPayload: {
    id: number;
    email: string;
  };
};

const userRoutes = new OpenAPIHono<{ Variables: Variables }>();
const authMiddleware = jwt({ secret: env.JWT_SECRET });

const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema.array() } },
      description: "Lista de usuários recuperada com sucesso",
    },
    401: { description: "Token inválido ou ausente" },
  },
});

const createUserRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: { "application/json": { schema: createUserSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: UserSchema } },
      description: "Usuário criado com sucesso",
    },
  },
});

// Wrapper para aplicar autenticação JWT em rotas específicas
const protectedHandler = (
  handler: (c: Context<{ Variables: Variables }>) => Promise<Response>,
) => {
  return async (c: Context<{ Variables: Variables }>, _next: Next) => {
    let handlerResponse: Response | undefined;
    const customNext = async () => {
      handlerResponse = await handler(c);
    };
    const result = await authMiddleware(c, customNext);
    return result ?? handlerResponse!;
  };
};

userRoutes.openapi(
  listUsersRoute,
  protectedHandler(async (c) => {
    const userService = new UserService();
    const users = await userService.getAll();
    return c.json(users, 200);
  }),
);

userRoutes.openapi(createUserRoute, async (c) => {
  const body = c.req.valid("json");
  const userService = new UserService();
  const newUser = await userService.create({
    email: body.email,
    name: body.name,
  });

  return c.json(newUser, 201);
});

export default userRoutes;
