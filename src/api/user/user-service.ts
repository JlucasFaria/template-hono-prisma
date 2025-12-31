import prisma from "../../db/client";

export class UserService {
  async create(data: { email: string; name?: string | null }) {
    return await prisma.user.create({
      data,
    });
  }
  async getAll() {
    return await prisma.user.findMany();
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}
