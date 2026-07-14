import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.profile.findUnique({ where: { userId } });
  }

  async upsert(
    userId: string,
    data: {
      name?: string;
      bio?: string;
      roles?: string[];
      avatarUrl?: string;
      primaryRole?: string;
      publicProfile?: boolean;
      pushNotificationsEnabled?: boolean;
    },
  ) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, avatarUrl },
      update: { avatarUrl },
    });
  }
}
