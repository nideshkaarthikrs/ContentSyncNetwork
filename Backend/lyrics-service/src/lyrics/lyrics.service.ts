import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateJson, isGeminiConfigured } from '../shared/gemini.client';
import { getInternal } from '../shared/internal-http.client';
import { CreateLyricsDto } from './dto/create-lyrics.dto';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { UpdateLyricsDto } from './dto/update-lyrics.dto';
import { LyricsRepository } from './lyrics.repository';

export interface GeneratedLyricsVersion {
  version: string;
  lyrics: string;
}

export interface GeneratedLyricsResult {
  versions: GeneratedLyricsVersion[];
}

function isGeneratedLyricsResult(value: unknown): value is GeneratedLyricsResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const versions = (value as { versions?: unknown }).versions;
  if (!Array.isArray(versions) || versions.length === 0) {
    return false;
  }
  return versions.every(
    (item) =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as { version?: unknown }).version === 'string' &&
      typeof (item as { lyrics?: unknown }).lyrics === 'string',
  );
}

function toDisplayId(seq: number): string {
  return 'LYR' + (2000 + seq).toString();
}

function parseDisplayId(lyricsId: string): number {
  const seq = parseInt(lyricsId.replace('LYR', ''), 10) - 2000;
  if (isNaN(seq)) {
    // NaN would reach Prisma as an invalid filter and surface as a 500.
    throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-4001', message: 'Lyrics not found' });
  }
  return seq;
}

@Injectable()
export class LyricsService {
  constructor(
    private readonly repo: LyricsRepository,
    private readonly config: ConfigService,
  ) {}

  async submit(authorId: string, dto: CreateLyricsDto) {
    const record = await this.repo.create(authorId, dto);
    return {
      status: 'SUCCESS',
      message: 'Lyrics submitted',
      data: { lyricsId: toDisplayId(record.sequenceNumber), status: 'SUBMITTED' },
    };
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

  async generate(dto: GenerateLyricsDto) {
    const cfg = {
      apiKey: this.config.get<string>('gemini.apiKey'),
      model: this.config.get<string>('gemini.model'),
    };

    if (isGeminiConfigured(cfg)) {
      const prompt =
        `Write 2 distinct versions of song lyrics in ${dto.language}, on the theme "${dto.theme}". ` +
        'Respond with strict JSON only, no markdown fences, matching exactly this shape: ' +
        '{"versions": [{"version": "A", "lyrics": "..."}, {"version": "B", "lyrics": "..."}]}. ' +
        'Each "lyrics" value must be the full lyrics text for that version, with no extra commentary.';

      const result = await generateJson<GeneratedLyricsResult>(cfg, prompt, isGeneratedLyricsResult);
      if (result) {
        return {
          status: 'SUCCESS',
          message: 'Lyrics generated',
          data: { versions: result.versions, source: 'gemini' as const },
        };
      }
    }

    return {
      status: 'SUCCESS',
      message: 'Lyrics generated',
      data: {
        versions: [
          { version: 'A', lyrics: '[Sample] Mazhai mazhai kaadhal mazhai...' },
          { version: 'B', lyrics: '[Sample] Nenjil oru poo malarndhadhu...' },
        ],
        source: 'sample' as const,
      },
    };
  }
}
