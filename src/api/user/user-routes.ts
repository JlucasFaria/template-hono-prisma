import { UserService } from "./user-service";
import {
  createUserSchema,
  createUserResponseSchema,
  listUsersResponseSchema,
} from "./user-schema";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { authMiddleware, type AuthVariables } from "../../middlewares/auth";
import { successResponse } from "../../utils/response";
import type { Context, Next } from "hono";

const userRoutes = new OpenAPIHono<{ Variables: AuthVariables }>();

const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": { schema: listUsersResponseSchema },
      },
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
      content: {
        "application/json": { schema: createUserResponseSchema },
      },
      description: "Usuário criado com sucesso",
    },
  },
});

// Wrapper para aplicar autenticação JWT em rotas específicas
const protectedHandler = (
  handler: (c: Context<{ Variables: AuthVariables }>) => Promise<Response>,
) => {
  return async (c: Context<{ Variables: AuthVariables }>, _next: Next) => {
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
    return successResponse(c, users, 200);
  }),
);

userRoutes.openapi(createUserRoute, async (c) => {
  const body = c.req.valid("json");
  const userService = new UserService();
  const newUser = await userService.create({
    email: body.email,
    name: body.name,
  });

  return successResponse(c, newUser, 201, "Usuário criado com sucesso");
});

export default userRoutes;
