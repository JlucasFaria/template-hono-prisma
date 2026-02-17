// Testes unitários do serviço de usuários
import { describe, it, expect, beforeEach } from "bun:test";
import { UserService } from "../user-service";
import prisma from "../../../db/client";

const userService = new UserService();

describe("UserService", () => {
  beforeEach(async () => {
    // Limpa o banco antes de cada teste para garantir isolamento
    await prisma.user.deleteMany();
  });

  it("deve criar um usuário no banco de dados", async () => {
    const userData = {
      email: "dev@test.com",
      name: "Dev Test",
      password: "secret1234",
    };
    const user = await userService.create(userData);

    expect(user).toHaveProperty("id");
    expect(user.email).toBe(userData.email);
    expect(user).not.toHaveProperty("password");
  });

  it("deve retornar todos os usuários cadastrados", async () => {
    await userService.create({
      email: "user1@test.com",
      password: "secret1234",
    });
    await userService.create({
      email: "user2@test.com",
      password: "secret1234",
    });

    const result = await userService.getAll();
    expect(result.users.length).toBe(2);
  });
});
