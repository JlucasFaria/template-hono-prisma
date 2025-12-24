import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: "teste@exemplo.com" }),
    name: z.string().nullable().openapi({ example: "Usuário Teste" }),
  })
  .openapi("User");

export const createUserSchema = z
  .object({
    email: z.email().openapi({
      description: "E-mail do novo usuário",
      example: "novo@exemplo.com",
    }),
    name: z.string().min(2).optional().openapi({
      description: "Nome do usuário (opcional)",
      example: "João Silva",
    }),
  })
  .openapi("CreateUserInput");

export type CreateUserInput = z.infer<typeof createUserSchema>;
