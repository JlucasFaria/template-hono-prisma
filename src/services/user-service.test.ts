import { describe, it, expect, beforeEach } from "bun:test";
import { UserService } from "./user-service";
import prisma from "../db/client";

const userService = new UserService();

describe("UserService", () => {
  beforeEach(async () => {
    // Limpa o banco antes de cada teste para garantir isolamento
    await prisma.user.deleteMany();
  });

  it("deve criar um usuário no banco de dados", async () => {
    const userData = { email: "dev@test.com", name: "Dev Test" };
    const user = await userService.create(userData);

    expect(user).toHaveProperty("id");
    expect(user.email).toBe(userData.email);
  });

  it("deve retornar todos os usuários cadastrados", async () => {
    await userService.create({ email: "user1@test.com" });
    await userService.create({ email: "user2@test.com" });

    const users = await userService.getAll();
    expect(users.length).toBe(2);
  });
});
