import { Injectable } from '@nestjs/common';
import { CreateFeedItemDto } from './dto/create-feed-item.dto';
import { FeedRepository } from './feed.repository';

function toDisplayId(seq: number): string {
  return 'FED' + (12000 + seq).toString();
}

@Injectable()
export class FeedService {
  constructor(private readonly repo: FeedRepository) {}

  async recordItem(dto: CreateFeedItemDto) {
    const item = await this.repo.create(dto.type, dto.sourceId, dto.actorUserId, dto.title, dto.metadata);
    return { status: 'SUCCESS', message: 'Feed item recorded', data: { feedItemId: toDisplayId(item.sequenceNumber) } };
  }

  // Ranking-aware trending/recommended feeds would need vote-count joins across
  // services with no shared event bus at MVP — all three feeds read the same
  // reverse-chronological page for now.
  async getFeed(page: number, pageSize: number, message: string) {
    const [items, total] = await this.repo.findPage(page, pageSize);
    return {
      status: 'SUCCESS',
      message,
      data: {
        page,
        pageSize,
        totalRecords: total,
        data: items.map((i) => ({
          feedItemId: toDisplayId(i.sequenceNumber),
          type: i.type,
          sourceId: i.sourceId,
          actorUserId: i.actorUserId,
          title: i.title,
          metadata: i.metadata,
          createdAt: i.createdAt,
        })),
      },
    };
  }
}
