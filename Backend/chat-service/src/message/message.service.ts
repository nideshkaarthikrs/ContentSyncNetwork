import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getInternal } from '../shared/internal-http.client';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageGateway } from './message.gateway';
import { MessageRepository } from './message.repository';

function toDisplayId(seq: number): string {
  return 'MSG' + (6000 + seq).toString();
}

@Injectable()
export class MessageService {
  constructor(
    private readonly repo: MessageRepository,
    private readonly gateway: MessageGateway,
    private readonly config: ConfigService,
  ) {}

  private async checkMembership(projectId: string, userId: string, userDisplayId: string): Promise<boolean> {
    const url = `${this.config.get<string>('projectService.url')}/internal/projects/${projectId}/membership?userId=${encodeURIComponent(userId)}&userDisplayId=${encodeURIComponent(userDisplayId)}`;
    const result = await getInternal<{ data: { isMember: boolean } }>(url, this.config.get<string>('internal.secret'));
    return !!result?.data?.isMember;
  }

  async send(projectId: string, senderId: string, senderUserId: string, senderName: string, dto: SendMessageDto) {
    const isMember = await this.checkMembership(projectId, senderId, senderUserId);
    if (!isMember) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-CHAT-001', message: 'Only project members can send messages' });
    }

    const record = await this.repo.create(projectId, senderId, senderUserId, senderName, dto.message);
    const data = {
      messageId: toDisplayId(record.sequenceNumber),
      projectId,
      message: record.message,
      senderUserId: record.senderUserId,
      senderName: record.senderName,
      sentAt: record.createdAt,
    };
    this.gateway.broadcastMessage(projectId, data);
    return {
      status: 'SUCCESS',
      message: 'Message sent',
      data,
    };
  }

  async getHistory(projectId: string, requesterId: string, requesterUserId: string, page: number, pageSize: number) {
    const isMember = await this.checkMembership(projectId, requesterId, requesterUserId);
    if (!isMember) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-CHAT-002', message: 'Only project members can view messages' });
    }

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
