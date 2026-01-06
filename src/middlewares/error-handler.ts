// src/middlewares/error-handler.ts
import { HTTPException } from "hono/http-exception";
import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { env } from "../config/env";

export const errorHandler: ErrorHandler = (err, c) => {
  // Erros de validação Zod
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: "Erro de validação",
        details: err.issues.map((e) => ({
          path: e.path.map(String).join("."), // Converte números para string
          message: e.message,
        })),
      },
      400,
    );
  }

  // Exceções HTTP do Hono (401, 400, etc)
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    );
  }

  // Erros do Prisma (duplicação de registro)
  // Verifica se é um erro do Prisma com código P2002
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof err.code === "string" &&
    err.code === "P2002"
  ) {
    return c.json(
      {
        success: false,
        error: "Registro duplicado",
        message: "Já existe um registro com esses dados",
      },
      409,
    );
  }

  // Erros inesperados do servidor
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  console.error(`[Fatal Error]: ${errorStack || errorMessage}`);
  return c.json(
    {
      success: false,
      error: "Erro interno do servidor",
      message: env.NODE_ENV === "development" ? errorMessage : undefined,
    },
    500,
  );
};
