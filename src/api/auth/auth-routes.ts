// Authentication routes: login, refresh token, and logout
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { env } from "../../config/env";
import { UserService } from "../user/user-service";
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

const authRoutes = new OpenAPIHono();
const userService = new UserService();
const authService = new AuthService();

async function generateAccessToken(user: { id: number; email: string }) {
  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
  };

  return await sign(payload, env.JWT_SECRET);
}

// === POST /login ===
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

// === POST /refresh ===
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

// === POST /logout ===
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

  const user = await userService.findByEmail(email);

  if (!user) {
    return errorResponse(c, "Invalid credentials", 401);
  }

  const isValid = await userService.verifyPassword(user.password, password);

  if (!isValid) {
    return errorResponse(c, "Invalid credentials", 401);
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await authService.generateRefreshToken(user.id);

  return successResponse(c, { token: accessToken, refreshToken }, 200);
});

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
  );
});

// === Logout Handler ===
authRoutes.openapi(logoutRoute, async (c) => {
  const { refreshToken } = c.req.valid("json");

  try {
    await authService.revokeRefreshToken(refreshToken);
  } catch {
    // Token doesn't exist — that's fine, treat as already logged out
  }

  return successResponse(c, { message: "Logged out successfully" }, 200);
});

export default authRoutes;
