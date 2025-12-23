import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    },
    { message: "Formato de e-mail inválido" },
  ),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
