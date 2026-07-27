import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { postInternal } from '../shared/internal-http.client';
import { CreateTuneDto } from './dto/create-tune.dto';
import { TuneRepository } from './tune.repository';

function toDisplayId(seq: number): string {
  return 'TUN' + (1000 + seq).toString();
}

function parseDisplayId(tuneId: string): number {
  const seq = parseInt(tuneId.replace('TUN', ''), 10) - 1000;
  if (isNaN(seq)) {
    // NaN would reach Prisma as an invalid filter and surface as a 500.
    throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-3001', message: 'Tune not found' });
  }
  return seq;
}

@Injectable()
export class TuneService {
  constructor(
    private readonly repo: TuneRepository,
    private readonly config: ConfigService,
  ) {}

  async create(ownerId: string, dto: CreateTuneDto, filename: string) {
    const tune = await this.repo.create(ownerId, dto, `/uploads/${filename}`);
    postInternal(`${this.config.get<string>('feedService.url')}/internal/feed-items`, this.config.get<string>('internal.secret'), {
      type: 'TUNE',
      sourceId: toDisplayId(tune.sequenceNumber),
      actorUserId: ownerId,
      title: dto.title,
    }).catch(() => {});
    return { tuneId: toDisplayId(tune.sequenceNumber), status: 'UPLOADED' };
  }

  async getMyTunes(ownerId: string, page: number, limit: number) {
    const { tunes, total } = await this.repo.findByOwner(ownerId, page, limit);
    return {
      status: 'SUCCESS',
      message: 'Tunes retrieved',
      data: {
        tunes: tunes.map((t) => ({ ...t, tuneId: toDisplayId(t.sequenceNumber) })),
        total,
        page,
        limit,
      },
    };
  }

  async getTune(tuneId: string) {
    const seq = parseDisplayId(tuneId);
    const tune = await this.repo.findBySequenceNumber(seq);
    if (!tune) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-3001', message: 'Tune not found' });
    }
    return { status: 'SUCCESS', message: 'Tune retrieved', data: { ...tune, tuneId: toDisplayId(tune.sequenceNumber) } };
  }

  async deleteTune(tuneId: string, requesterId: string) {
    const seq = parseDisplayId(tuneId);
    const tune = await this.repo.findBySequenceNumber(seq);
    if (!tune) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-3001', message: 'Tune not found' });
    }
    if (tune.ownerId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-3002', message: 'You are not the owner of this tune' });
    }
    await this.repo.delete(tune.id);
    return { status: 'SUCCESS', message: 'Tune deleted' };
  }

  async getOwner(tuneId: string) {
    const seq = parseDisplayId(tuneId);
    const tune = await this.repo.findBySequenceNumber(seq);
    if (!tune) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-3001', message: 'Tune not found' });
    }
    return {
      status: 'SUCCESS',
      message: 'Owner retrieved',
      data: { ownerUserId: tune.ownerId, title: tune.title },
    };
  }

  async analyzeTune(tuneId: string, requesterId: string) {
    const seq = parseDisplayId(tuneId);
    const tune = await this.repo.findBySequenceNumber(seq);
    if (!tune) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-3001', message: 'Tune not found' });
    }
    if (tune.ownerId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-3002', message: 'You are not the owner of this tune' });
    }
    return {
      status: 'SUCCESS',
      message: 'Analysis complete',
      data: {
        genre: tune.genre,
        bpm: tune.bpm ?? 120,
        key: 'C Major',
        mood: tune.mood,
        confidence: 87,
      },
    };
  }
}
