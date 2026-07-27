import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getInternal } from '../shared/internal-http.client';
import { CreateLyricsDto } from './dto/create-lyrics.dto';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { UpdateLyricsDto } from './dto/update-lyrics.dto';
import { LyricsRepository } from './lyrics.repository';

function toDisplayId(seq: number): string {
  return 'LYR' + (2000 + seq).toString();
}

function parseDisplayId(lyricsId: string): number {
  return parseInt(lyricsId.replace('LYR', ''), 10) - 2000;
}

@Injectable()
export class LyricsService {
  constructor(
    private readonly repo: LyricsRepository,
    private readonly config: ConfigService,
  ) {}

  async submit(authorId: string, dto: CreateLyricsDto) {
    const record = await this.repo.create(authorId, dto);
    return { lyricsId: toDisplayId(record.sequenceNumber), status: 'SUBMITTED' };
  }

  async update(lyricsId: string, requesterId: string, dto: UpdateLyricsDto) {
    const seq = parseDisplayId(lyricsId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-4001', message: 'Lyrics not found' });
    }
    if (record.authorId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-4002', message: 'You are not the author of these lyrics' });
    }
    const updated = await this.repo.update(record.id, dto);
    return {
      status: 'SUCCESS',
      message: 'Lyrics updated',
      data: { ...updated, lyricsId: toDisplayId(updated.sequenceNumber) },
    };
  }

  async getById(lyricsId: string) {
    const seq = parseDisplayId(lyricsId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-4001', message: 'Lyrics not found' });
    }
    return {
      status: 'SUCCESS',
      message: 'Lyrics retrieved',
      data: { ...record, lyricsId: toDisplayId(record.sequenceNumber) },
    };
  }

  async approve(lyricsId: string, requesterRoles: string[], requesterUserId: string) {
    if (!requesterRoles.includes('COMPOSER')) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-4002', message: 'Only composers can approve lyrics' });
    }
    const seq = parseDisplayId(lyricsId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-4001', message: 'Lyrics not found' });
    }
    // Only the owner of the tune these lyrics were written for may approve
    // them. Fails closed: an unreachable tune-service refuses the approval.
    const owner = await getInternal<{ data: { ownerUserId: string } }>(
      `${this.config.get<string>('tuneService.url')}/internal/tunes/${record.tuneId}/owner`,
      this.config.get<string>('internal.secret'),
    );
    if (!owner || owner.data.ownerUserId !== requesterUserId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-4004', message: 'Only the owner of the tune can approve its lyrics' });
    }
    if (record.status === 'APPROVED') {
      throw new ConflictException({ status: 'ERROR', errorCode: 'CSN-4003', message: 'Lyrics already approved' });
    }
    await this.repo.setStatus(record.id, 'APPROVED');
    return { status: 'SUCCESS', message: 'Lyrics approved' };
  }

  async listForTune(tuneId: string, page: number, pageSize: number) {
    const { lyrics, total } = await this.repo.findByTuneId(tuneId, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'Lyrics retrieved',
      data: {
        lyrics: lyrics.map((l) => ({ ...l, lyricsId: toDisplayId(l.sequenceNumber) })),
        page,
        pageSize,
        totalRecords: total,
      },
    };
  }

  generate(_dto: GenerateLyricsDto) {
    return {
      versions: [
        { version: 'A', lyrics: 'Mazhai mazhai kaadhal mazhai...' },
        { version: 'B', lyrics: 'Nenjil oru poo malarndhadhu...' },
      ],
    };
  }
}
