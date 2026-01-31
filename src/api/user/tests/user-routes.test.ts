import { describe, it, expect, beforeAll } from "bun:test";
import app from "../../../../src/index";
import prisma from "../../../db/client";
import { sign } from "hono/jwt";
import { env } from "../../../config/env";

describe("User Routes", () => {
  let token: string;

  beforeAll(async () => {
    await prisma.user.deleteMany();

    // Gera token JWT para autenticação nos testes
    const payload = {
      id: 1,
      email: "test@example.com",
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    token = await sign(payload, env.JWT_SECRET);
  });

  it("Deve criar um novo usuário com sucesso", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const body = (await res.json()) as {
      success: true;
      data: { email: string; id: number; name: string | null };
    };

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("test@example.com");
  });

  it("Deve listar todos os usuários", async () => {
    const res = await app.request("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = (await res.json()) as {
      success: true;
      data: Array<{
        id: number;
        email: string;
        name?: string | null;
      }>;
    };

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
