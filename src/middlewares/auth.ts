import { jwt } from "hono/jwt";
import { env } from "../config/env";
import type { Context } from "hono";

export type AuthVariables = {
  jwtPayload: {
    id: number;
    email: string;
    exp: number;
  };
};

export const authMiddleware = jwt({ secret: env.JWT_SECRET });

// Helper to extract the JWT payload in a type-safe way
export function getAuthPayload(c: Context<{ Variables: AuthVariables }>) {
  return c.get("jwtPayload");
}
