import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { error } from '../shared/response.helper';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VoteRepository } from './vote.repository';

function toDisplayId(seq: number): string {
  return 'VOT' + (7000 + seq).toString();
}

@Injectable()
export class VoteService {
  constructor(private readonly repo: VoteRepository) {}

  async cast(user: { id: string; userId: string }, dto: CastVoteDto) {
    try {
      const record = await this.repo.create(user.id, user.userId, dto.entityType, dto.entityId);
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
