import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL do banco de dados inválida" },
  ),
  JWT_SECRET: z.string().min(32, "O segredo deve ter pelo menos 32 caracteres"),
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Erro nas variáveis de ambiente:", _env.error.format());
  throw new Error("Variáveis de ambiente inválidas.");
}

export const env = _env.data;
