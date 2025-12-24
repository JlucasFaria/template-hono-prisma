import { describe, it, expect, beforeAll } from "bun:test";
import app from "../../../../src/index";
import prisma from "../../../db/client";

describe("User Routes", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
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
      },
    });

    const body = (await res.json()) as { email: string; id: number };

    expect(res.status).toBe(201);
    expect(body.email).toBe("test@example.com");
    expect(body.id).toBeDefined();
  });

  it("Deve listar todos os usuários", async () => {
    const res = await app.request("/api/users");
    const body = (await res.json()) as Array<{
      id: number;
      email: string;
      name?: string | null;
    }>;

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
