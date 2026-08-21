import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, senderId: string, senderUserId: string, senderName: string, message: string) {
    return this.prisma.message.create({
      data: { projectId, senderId, senderUserId, senderName, message },
    });
  }

  async findByProject(projectId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { projectId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where: { projectId } }),
    ]);
    return { messages, total };
  }
}
