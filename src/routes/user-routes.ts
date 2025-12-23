import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../services/user-service";
import { createUserSchema } from "../schemas/user-schema";

const userRoutes = new Hono();

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
