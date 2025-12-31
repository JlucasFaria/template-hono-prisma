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

// Handler wrapper que aplica middleware apenas a esta rota específica
const protectedHandler = (
  handler: (c: Context<{ Variables: Variables }>) => Promise<Response>,
) => {
  return async (c: Context<{ Variables: Variables }>, _next: Next) => {
    let handlerResponse: Response | undefined;
    // Cria um next customizado que chama o handler e armazena o resultado
    const customNext = async () => {
      handlerResponse = await handler(c);
    };
    // Aplica autenticação - se falhar, retorna Response (401)
    // Se passar, chama customNext que executa o handler
    const result = await authMiddleware(c, customNext);
    // Se o middleware retornou uma Response (erro), retorna ela
    // Caso contrário, retorna a resposta do handler
    return result ?? handlerResponse!;
  };
};

// GET
userRoutes.openapi(
  listUsersRoute,
  protectedHandler(async (c) => {
    const userService = new UserService();
    const users = await userService.getAll();
    return c.json(users, 200);
  }),
);

// POST
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
