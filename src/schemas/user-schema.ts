import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email({ message: "Formato de e-mail inválido" }),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
