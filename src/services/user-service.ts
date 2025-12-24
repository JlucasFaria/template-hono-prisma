import prisma from "../db/client";

export class UserService {
  async create(data: { email: string; name?: string }) {
    // Remove campos undefined para evitar erro de constraint no Prisma
    const prismaData: { email: string; name?: string } = {
      email: data.email,
    };

    if (data.name !== undefined) {
      prismaData.name = data.name;
    }

    return await prisma.user.create({
      data: prismaData,
    });
  }

  async getAll() {
    return await prisma.user.findMany();
  }
}
