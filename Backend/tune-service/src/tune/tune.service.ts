import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { extname, join } from 'path';
import { generateFromAudio, isGeminiConfigured } from '../shared/gemini.client';
import { postInternal } from '../shared/internal-http.client';
import { UPLOADS_ROOT } from '../shared/uploads-path';
import { CreateTuneDto } from './dto/create-tune.dto';
import { TuneRepository } from './tune.repository';

// Multer's diskStorage only preserves the original file extension (see
// tune.controller.ts's `filename` callback), not the original mimetype, so
// the mime type Gemini needs for inline_data has to be derived from it.
const AUDIO_EXT_TO_MIME: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
};

interface GeminiAudioAnalysisResult {
  key: string;
  bpm: number;
  mood: string;
  confidence: number;
}

function isGeminiAudioAnalysisResult(value: unknown): value is GeminiAudioAnalysisResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === 'string' &&
    typeof v.bpm === 'number' &&
    typeof v.mood === 'string' &&
    typeof v.confidence === 'number'
  );
}

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
  private readonly logger = new Logger(TuneService.name);

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
    return {
      status: 'SUCCESS',
      message: 'Tune uploaded',
      data: { tuneId: toDisplayId(tune.sequenceNumber), status: 'UPLOADED' },
    };
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

    const filename = tune.audioUrl.replace(/^\/uploads\//, '');
    await unlink(join(UPLOADS_ROOT, filename)).catch((err) => {
      if (err?.code !== 'ENOENT') {
        this.logger.warn(`Failed to delete audio file for ${tuneId}: ${err.message}`);
      }
    });

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

    const cfg = {
      apiKey: this.config.get<string>('gemini.apiKey'),
      model: this.config.get<string>('gemini.model'),
    };

    if (isGeminiConfigured(cfg)) {
      const filename = tune.audioUrl.replace(/^\/uploads\//, '');
      const audioFilePath = join(UPLOADS_ROOT, filename);
      const mimeType = AUDIO_EXT_TO_MIME[extname(filename).toLowerCase()];

      if (mimeType) {
        const prompt =
          'Analyze the attached song audio and estimate its musical key, tempo, and mood. ' +
          'Respond with strict JSON only, no markdown fences, matching exactly this shape: ' +
          '{"key": "C Major", "bpm": 120, "mood": "Energetic", "confidence": 87}. ' +
          '"key" is the musical key (e.g. "C Major", "A Minor"), "bpm" is the estimated tempo in ' +
          'beats per minute, "mood" is a short descriptive word, and "confidence" is your confidence ' +
          'in this analysis as an integer percentage from 0 to 100.';

        const result = await generateFromAudio<GeminiAudioAnalysisResult>(
          cfg,
          prompt,
          audioFilePath,
          mimeType,
          isGeminiAudioAnalysisResult,
        );

        if (result) {
          return {
            status: 'SUCCESS',
            message: 'Analysis complete',
            data: {
              genre: tune.genre,
              bpm: result.bpm,
              key: result.key,
              mood: result.mood,
              confidence: result.confidence,
              analysisType: 'gemini-audio' as const,
              source: 'gemini' as const,
            },
          };
        }
      } else {
        this.logger.warn(`analyzeTune: no known mime type for audio file extension of ${filename}, skipping Gemini audio analysis`);
      }
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
        analysisType: 'metadata-estimate' as const,
        source: 'sample' as const,
      },
    };
  }
}
