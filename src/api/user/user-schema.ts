// Zod schemas for user validation and OpenAPI documentation
import { z } from "@hono/zod-openapi";
import { successResponseSchema } from "../../schemas/response";
import { paginationMetaSchema } from "../../schemas/pagination";

export const UserSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: "dev@test.com" }),
    name: z.string().nullable().openapi({ example: "John Doe" }),
    createdAt: z.string().datetime().openapi({ description: "Creation date" }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ description: "Last update date" }),
  })
  .openapi("User");

export const createUserSchema = z
  .object({
    email: z.email().openapi({
      description: "New user email",
      example: "new@example.com",
    }),
    name: z.string().min(2).optional().openapi({
      description: "User name (optional)",
      example: "John Doe",
    }),
    password: z.string().min(8).openapi({
      description: "User password",
      example: "secret123",
    }),
  })
  .openapi("CreateUserInput");

// User creation response schema
export const createUserResponseSchema = successResponseSchema(UserSchema);

// Paginated user list response schema
export const paginatedUsersResponseSchema = z
  .object({
    success: z.literal(true),
    data: UserSchema.array(),
    pagination: paginationMetaSchema,
  })
  .openapi("PaginatedUsersResponse");

export type CreateUserInput = z.infer<typeof createUserSchema>;
