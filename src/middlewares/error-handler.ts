// Global error handler: maps known errors to appropriate HTTP responses
import { HTTPException } from "hono/http-exception";
import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { env } from "../config/env";

export const errorHandler: ErrorHandler = (err, c) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: "Validation error",
        details: err.issues.map((e) => ({
          path: e.path.map(String).join("."), // Convert array indices to string
          message: e.message,
        })),
      },
      400,
    );
  }

  // Hono HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    );
  }

  // Prisma P2002 — unique constraint violation (duplicate record)
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
        error: "Email already in use",
      },
      409,
    );
  }

  // Prisma P2025 — record not found (update/delete on non-existent record)
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof err.code === "string" &&
    err.code === "P2025"
  ) {
    return c.json({ success: false, error: "Record not found" }, 404);
  }

  // Unexpected server errors
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  console.error(`[Fatal Error]: ${errorStack || errorMessage}`);
  return c.json(
    {
      success: false,
      error: "Internal server error",
      message: env.NODE_ENV === "development" ? errorMessage : undefined,
    },
    500,
  );
};
