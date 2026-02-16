import crypto from "crypto";
import prismaClient from "../../db/client";
import type { PrismaClient } from "../../../generated/prisma";

export class AuthService {
  constructor(private prisma: PrismaClient = prismaClient) {}
  async generateRefreshToken(userId: number) {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) return null;

    if (refreshToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { token } });
      return null;
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  async revokeAllUserTokens(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
