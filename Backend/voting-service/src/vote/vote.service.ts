import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { error } from '../shared/response.helper';
import { getInternal, postInternal } from '../shared/internal-http.client';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VoteRepository } from './vote.repository';

function toDisplayId(seq: number): string {
  return 'VOT' + (7000 + seq).toString();
}

@Injectable()
export class VoteService {
  constructor(
    private readonly repo: VoteRepository,
    private readonly config: ConfigService,
  ) {}

  async cast(user: { id: string; userId: string }, dto: CastVoteDto) {
    try {
      const record = await this.repo.create(user.id, user.userId, dto.entityType, dto.entityId);
      this.notifyOwner(dto.entityType, dto.entityId).catch(() => {});
      return {
        status: 'SUCCESS',
        message: 'Vote cast successfully',
        data: {
          voteId: toDisplayId(record.sequenceNumber),
          entityType: record.entityType,
          entityId: record.entityId,
        },
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(error('CSN-VOTE-001', 'Already voted on this entity'));
      }
      throw err;
    }
  }

  // Voting-service has no local record of who owns the voted-on entity, so
  // resolving "your tune got a vote" needs a synchronous cross-service lookup —
  // the one deliberate exception to the fire-and-forget-only internal-call
  // convention used everywhere else in this codebase. A failed lookup just
  // skips the notification; it never affects the vote-cast response above.
  private async notifyOwner(entityType: string, entityId: string) {
    if (entityType !== 'TUNE') {
      return;
    }
    const internalSecret = this.config.get<string>('internal.secret');
    const owner = await getInternal<{ data: { ownerUserId: string; title: string } }>(
      `${this.config.get<string>('tuneService.url')}/internal/tunes/${entityId}/owner`,
      internalSecret,
    );
    if (!owner) {
      return;
    }
    await postInternal(`${this.config.get<string>('notificationService.url')}/internal/notifications`, internalSecret, {
      recipientUserId: owner.data.ownerUserId,
      type: 'VOTE_RECEIVED',
      title: `Your tune "${owner.data.title}" received a vote`,
      sourceId: entityId,
    });
  }

  async getResults(entityId: string) {
    const voteCount = await this.repo.countByEntityId(entityId);

    const entityRecord = await this.repo.findOneByEntityId(entityId);
    if (!entityRecord) {
      return {
        status: 'SUCCESS',
        message: 'Voting results retrieved',
        data: { entityId, votes: 0, rank: 1 },
      };
    }

    const entitiesAhead = await this.repo.countEntitiesWithMoreVotes(
      entityRecord.entityType,
      voteCount,
    );
    const rank = entitiesAhead + 1;

    return {
      status: 'SUCCESS',
      message: 'Voting results retrieved',
      data: { entityId, votes: voteCount, rank },
    };
  }
}
