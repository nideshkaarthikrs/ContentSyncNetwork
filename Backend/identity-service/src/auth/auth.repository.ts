import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeEmail } from '../shared/normalize-email.util';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  async findUserByIdentifier(identifier: string) {
    // Mobile numbers are stored as-entered (only email is normalized on
    // write), so the mobile branch must not be lowercased.
    const email = normalizeEmail(identifier);
    const mobile = identifier.trim();
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    mobile: string;
    passwordHash: string;
    roles: Role[];
  }) {
    return this.prisma.user.create({
      data: { ...data, email: normalizeEmail(data.email) },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  /**
   * deleteMany instead of delete: under concurrent rotation of the same token
   * the loser must see count 0 (and get a 401 from the caller), not a thrown
   * P2025 that surfaces as a 500.
   */
  async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllRefreshTokensForUser(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
