import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(followerId: string, followingId: string) {
    const record = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!record;
  }

  async follow(followerId: string, followingId: string) {
    return this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });
  }

  async unfollow(followerId: string, followingId: string) {
    return this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
  }

  async getFollowers(followingId: string) {
    return this.prisma.follow.findMany({
      where: { followingId },
      select: { followerId: true, createdAt: true },
    });
  }

  async countFollowers(followingId: string) {
    return this.prisma.follow.count({ where: { followingId } });
  }
}
