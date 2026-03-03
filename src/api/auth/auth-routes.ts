// Authentication routes: login, refresh token, and logout
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_TTL_SECONDS } from "../../config/constants";
import { AuthService } from "./auth-service";
import {
  loginSchema,
  authResponseSchema,
  refreshTokenSchema,
  logoutResponseSchema,
} from "./auth-schema";
import {
  errorResponseSchema,
  validationErrorResponseSchema,
} from "../../schemas/response";
import { successResponse, errorResponse } from "../../utils/response";

// Minimal interface — auth only needs these two methods from the user domain.
// Using an interface instead of importing UserService directly keeps this module
// decoupled from the user implementation and easier to test in isolation.
export interface IUserAuthRepository {
  findByEmail(
    email: string,
  ): Promise<{ id: number; email: string; password: string } | null>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
}

// === Factory function ===
// Receives a userRepo and an optional authService (defaults to a new AuthService).
// Wiring with concrete implementations happens at the composition root (index.ts).
export function createAuthRoutes(
  userRepo: IUserAuthRepository,
  authService: AuthService = new AuthService(),
) {
  const authRoutes = new OpenAPIHono();

  async function generateAccessToken(user: { id: number; email: string }) {
    const payload = {
      id: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    };
    return await sign(payload, env.JWT_SECRET);
  }

  // === Route Definitions ===

  const loginRoute = createRoute({
    method: "post",
    path: "/login",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: loginSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: authResponseSchema } },
        description: "Login successful, returns access and refresh tokens",
      },
      400: {
        content: {
          "application/json": { schema: validationErrorResponseSchema },
        },
        description: "Validation error",
      },
      401: {
        content: { "application/json": { schema: errorResponseSchema } },
        description: "Invalid credentials",
      },
    },
  });

  const refreshRoute = createRoute({
    method: "post",
    path: "/refresh",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: refreshTokenSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: authResponseSchema } },
        description: "Tokens refreshed successfully",
      },
      400: {
        content: {
          "application/json": { schema: validationErrorResponseSchema },
        },
        description: "Validation error",
      },
      401: {
        content: { "application/json": { schema: errorResponseSchema } },
        description: "Invalid or expired refresh token",
      },
    },
  });

  const logoutRoute = createRoute({
    method: "post",
    path: "/logout",
    tags: ["Auth"],
    request: {
      body: {
        content: { "application/json": { schema: refreshTokenSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: logoutResponseSchema } },
        description: "Logout successful, refresh token revoked",
      },
      400: {
        content: {
          "application/json": { schema: validationErrorResponseSchema },
        },
        description: "Validation error",
      },
    },
  });

  // === Login Handler ===
  authRoutes.openapi(loginRoute, async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await userRepo.findByEmail(email);

    if (!user) {
      return errorResponse(c, "Invalid credentials", 401);
    }

    const isValid = await userRepo.verifyPassword(user.password, password);

    if (!isValid) {
      return errorResponse(c, "Invalid credentials", 401);
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await authService.generateRefreshToken(user.id);

    return successResponse(
      c,
      { token: accessToken, refreshToken },
      200,
      "Login successful",
    );
  });

  // === Refresh Handler ===
  authRoutes.openapi(refreshRoute, async (c) => {
    const { refreshToken } = c.req.valid("json");

    const storedToken = await authService.validateRefreshToken(refreshToken);

    if (!storedToken) {
      return errorResponse(c, "Invalid or expired refresh token", 401);
    }

    await authService.revokeRefreshToken(refreshToken);

    const accessToken = await generateAccessToken(storedToken.user);
    const newRefreshToken = await authService.generateRefreshToken(
      storedToken.userId,
    );

    return successResponse(
      c,
      { token: accessToken, refreshToken: newRefreshToken },
      200,
      "Tokens refreshed successfully",
    );
  });

  // === Logout Handler ===
  // NOTE: Stateless JWT limitation — revoking the refresh token prevents new access tokens
  // from being issued, but the current access token remains valid until it expires (~1h).
  // For immediate revocation, a token blacklist (e.g. Redis) would be required.
  authRoutes.openapi(logoutRoute, async (c) => {
    const { refreshToken } = c.req.valid("json");

    try {
      await authService.revokeRefreshToken(refreshToken);
    } catch {
      // Token doesn't exist — that's fine, treat as already logged out
    }

    return successResponse(c, { message: "Logged out successfully" }, 200);
  });

  return authRoutes;
}
