import prisma from "../db/client";

export class UserService {
  async create(data: { email: string; name?: string }) {
    return await prisma.user.create({
      data,
    });
  }

  async getAll() {
    return await prisma.user.findMany();
  }
}
