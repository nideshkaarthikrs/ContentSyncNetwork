import { Injectable } from '@nestjs/common';
import { FeedItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(type: FeedItemType, sourceId: string, actorUserId: string, title: string, metadata?: Record<string, any>) {
    return this.prisma.feedItem.create({
      data: { type, sourceId, actorUserId, title, metadata },
    });
  }

  findPage(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      this.prisma.feedItem.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.feedItem.count(),
    ]);
  }
}
