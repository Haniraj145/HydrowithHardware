import { prisma } from "../../lib/prisma";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({ data });
  }

  async updateUser(
    id: string,
    data: { fullName?: string; passwordHash?: string }
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async createRefreshToken(data: {
    token: string;
    expiresAt: Date;
    userId: string;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  // ==========================
  // Email Verification
  // ==========================

  async createEmailVerificationToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.emailVerificationToken.create({ data });
  }

  async findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.delete({
      where: { token },
    });
  }

  async deleteEmailVerificationTokensByUserId(userId: string) {
    return prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });
  }

  async verifyUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  // ==========================
  // Password Reset
  // ==========================

  async createPasswordResetToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(token: string) {
    return prisma.passwordResetToken.delete({
      where: { token },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();
