import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(voterId: string, voterUserId: string, entityType: string, entityId: string) {
    return this.prisma.vote.create({
      data: { voterId, voterUserId, entityType, entityId },
    });
  }

  countByEntityId(entityId: string) {
    return this.prisma.vote.count({ where: { entityId } });
  }

  findOneByEntityId(entityId: string) {
    return this.prisma.vote.findFirst({ where: { entityId }, select: { entityType: true } });
  }

  async countEntitiesWithMoreVotes(entityType: string, threshold: number): Promise<number> {
    const groups = await this.prisma.vote.groupBy({
      by: ['entityId'],
      where: { entityType },
      _count: { entityId: true },
      having: { entityId: { _count: { gt: threshold } } },
    });
    return groups.length;
  }
}
