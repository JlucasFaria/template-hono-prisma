import { zValidator } from "@hono/zod-validator";
import { UserService } from "../services/user-service";
import { createUserSchema, UserSchema } from "../schemas/user-schema";
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

userRoutes.openapi(listUsersRoute, async (c) => {
  const userService = new UserService();
  const users = await userService.getAll();
  return c.json(users, 200);
});

// Listar todos os utilizadores
userRoutes.get("/", async (c) => {
  const userService = new UserService();
  const users = await userService.getAll();
  return c.json(users);
});

// Criar um novo utilizador com validação Zod
userRoutes.post("/", zValidator("json", createUserSchema), async (c) => {
  // Os dados aqui já chegam validados pelo middleware
  const body = c.req.valid("json");
  const userService = new UserService();

  const newUser = await userService.create({
    email: body.email,
    name: body.name,
  });

  return c.json(newUser, 201);
});

export default userRoutes;
