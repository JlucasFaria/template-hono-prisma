// Shared response schemas for OpenAPI documentation
import { z } from "@hono/zod-openapi";

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z
        .literal(true)
        .openapi({ description: "Indicates successful operation" }),
      data: dataSchema,
      message: z
        .string()
        .optional()
        .openapi({ description: "Optional message" }),
    })
    .openapi("SuccessResponse");

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
  })
  .openapi("ErrorResponse");

export const validationErrorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
    details: z.unknown().optional(),
  })
  .openapi("ValidationErrorResponse");
