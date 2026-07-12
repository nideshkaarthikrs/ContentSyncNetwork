import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageRepository } from './message.repository';

function toDisplayId(seq: number): string {
  return 'MSG' + (6000 + seq).toString();
}

@Injectable()
export class MessageService {
  constructor(private readonly repo: MessageRepository) {}

  async send(projectId: string, senderId: string, senderUserId: string, senderName: string, dto: SendMessageDto) {
    const record = await this.repo.create(projectId, senderId, senderUserId, senderName, dto.message);
    return {
      status: 'SUCCESS',
      message: 'Message sent',
      data: {
        messageId: toDisplayId(record.sequenceNumber),
        projectId,
        message: record.message,
        senderUserId: record.senderUserId,
        senderName: record.senderName,
        sentAt: record.createdAt,
      },
    };
  }

  async getHistory(projectId: string, page: number, pageSize: number) {
    const { messages, total } = await this.repo.findByProject(projectId, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'Message history retrieved',
      data: {
        projectId,
        messages: messages.map((m) => ({
          messageId: toDisplayId(m.sequenceNumber),
          message: m.message,
          senderUserId: m.senderUserId,
          senderName: m.senderName,
          sentAt: m.createdAt,
        })),
        page,
        pageSize,
        totalRecords: total,
      },
    };
  }
}
