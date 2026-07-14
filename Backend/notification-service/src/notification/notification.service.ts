import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationRepository } from './notification.repository';

const DISPLAY_ID_OFFSET = 16000;

function toDisplayId(seq: number): string {
  return 'NOT' + (DISPLAY_ID_OFFSET + seq).toString();
}

function fromDisplayId(displayId: string): number {
  return parseInt(displayId.replace('NOT', ''), 10) - DISPLAY_ID_OFFSET;
}

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async recordNotification(recipientUserId: string, type: NotificationType, title: string, sourceId?: string) {
    const notification = await this.repo.create(recipientUserId, type, title, sourceId);
    return {
      status: 'SUCCESS',
      message: 'Notification recorded',
      data: { notificationId: toDisplayId(notification.sequenceNumber) },
    };
  }

  async getNotifications(recipientUserId: string, page: number, pageSize: number) {
    const [items, total, unreadCount] = await this.repo.findPage(recipientUserId, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'Notifications retrieved',
      data: {
        page,
        pageSize,
        totalRecords: total,
        unreadCount,
        data: items.map((n) => ({
          notificationId: toDisplayId(n.sequenceNumber),
          type: n.type,
          title: n.title,
          sourceId: n.sourceId,
          read: n.read,
          createdAt: n.createdAt,
        })),
      },
    };
  }

  async markAllRead(recipientUserId: string) {
    await this.repo.markAllRead(recipientUserId);
    return { status: 'SUCCESS', message: 'All notifications marked as read' };
  }

  async markRead(recipientUserId: string, notificationDisplayId: string) {
    const sequenceNumber = fromDisplayId(notificationDisplayId);
    if (isNaN(sequenceNumber)) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-NOTIF-001',
        message: 'Notification not found',
      });
    }
    const notification = await this.repo.findBySequence(recipientUserId, sequenceNumber);
    if (!notification) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-NOTIF-001',
        message: 'Notification not found',
      });
    }
    await this.repo.markRead(notification.id);
    return { status: 'SUCCESS', message: 'Notification marked as read' };
  }
}
