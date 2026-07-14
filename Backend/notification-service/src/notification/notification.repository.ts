import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(recipientUserId: string, type: NotificationType, title: string, sourceId?: string) {
    return this.prisma.notification.create({
      data: { recipientUserId, type, title, sourceId },
    });
  }

  findPage(recipientUserId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      this.prisma.notification.findMany({
        where: { recipientUserId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { recipientUserId } }),
      this.prisma.notification.count({ where: { recipientUserId, read: false } }),
    ]);
  }

  markAllRead(recipientUserId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientUserId, read: false },
      data: { read: true },
    });
  }

  findBySequence(recipientUserId: string, sequenceNumber: number) {
    return this.prisma.notification.findFirst({
      where: { recipientUserId, sequenceNumber },
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
