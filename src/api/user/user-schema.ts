// Schemas Zod para validação e documentação OpenAPI
import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: "dev@test.com" }),
    name: z.string().nullable().openapi({ example: "João Silva" }),
    createdAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid datetime string",
      })
      .openapi({ description: "Data de criação" }),
    updatedAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid datetime string",
      })
      .openapi({ description: "Data de atualização" }),
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

export const loginSchema = z
  .object({
    email: z.string().openapi({
      example: "admin@template.com",
      description: "User's registered email address",
    }),
  })
  .openapi("LoginInput");

export const loginResponseSchema = z
  .object({
    token: z.string().openapi({
      description:
        "JWT Token generated for authentication on protected routes.",
    }),
  })
  .openapi("LoginResponse");

export type CreateUserInput = z.infer<typeof createUserSchema>;
