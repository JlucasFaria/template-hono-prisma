import { UserService } from "./user-service";
import { createUserSchema, UserSchema } from "./user-schema";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

const userRoutes = new OpenAPIHono();

// Definição da rota para o OpenAPI
const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema.array() } },
      description: "Lista de usuários recuperada com sucesso",
    },
  },
});

// Definição da rota POST para o OpenAPI
const createUserRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: UserSchema } },
      description: "Usuário criado com sucesso",
    },
  },
});

// Listar todos os utilizadores
userRoutes.openapi(listUsersRoute, async (c) => {
  const userService = new UserService();
  const users = await userService.getAll();
  return c.json(users);
});

// Criar um novo utilizador (validação automática pelo OpenAPI)
userRoutes.openapi(createUserRoute, async (c) => {
  const body = c.req.valid("json"); // Já validado automaticamente pelo OpenAPIHono
  const userService = new UserService();

  const newUser = await userService.create({
    email: body.email,
    name: body.name,
  });

  return c.json(newUser, 201);
});

export default userRoutes;
