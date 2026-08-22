import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { generateFromAudio, isGeminiConfigured } from '../shared/gemini.client';
import { UPLOADS_ROOT } from '../shared/uploads-path';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { PerformanceRepository } from './performance.repository';

// Multer's diskStorage only preserves the original file extension (see
// performance.controller.ts's `filename` callback), not the original
// mimetype, so the mime type Gemini needs for inline_data has to be derived
// from it.
const AUDIO_EXT_TO_MIME: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
};

interface GeminiPerformanceAnalysisResult {
  pitchScore: number;
  clarityScore: number;
  rhythmScore: number;
  overallScore: number;
}

function isGeminiPerformanceAnalysisResult(value: unknown): value is GeminiPerformanceAnalysisResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.pitchScore === 'number' &&
    typeof v.clarityScore === 'number' &&
    typeof v.rhythmScore === 'number' &&
    typeof v.overallScore === 'number'
  );
}

function toDisplayId(seq: number): string {
  return 'PER' + (3000 + seq).toString();
}

function parseDisplayId(performanceId: string): number {
  const seq = parseInt(performanceId.replace('PER', ''), 10) - 3000;
  if (isNaN(seq)) {
    // NaN would reach Prisma as an invalid filter and surface as a 500.
    throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-5001', message: 'Performance not found' });
  }
  return seq;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly repo: PerformanceRepository,
    private readonly config: ConfigService,
  ) {}

  async upload(singerId: string, dto: CreatePerformanceDto, filename: string) {
    const record = await this.repo.create(singerId, dto, `/uploads/${filename}`);
    return {
      status: 'SUCCESS',
      message: 'Performance uploaded',
      data: { performanceId: toDisplayId(record.sequenceNumber) },
    };
  }

  async getMyPerformances(singerId: string, page: number, pageSize: number) {
    const { performances, total } = await this.repo.findBySinger(singerId, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'Performances retrieved',
      data: {
        performances: performances.map((p) => ({ ...p, performanceId: toDisplayId(p.sequenceNumber) })),
        page,
        pageSize,
        totalRecords: total,
      },
    };
  }

  async getById(performanceId: string, requesterId: string) {
    const seq = parseDisplayId(performanceId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-5001',
        message: 'Performance not found',
      });
    }
    if (record.singerId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-5002', message: 'You are not the owner of this performance' });
    }
    return {
      status: 'SUCCESS',
      message: 'Performance retrieved',
      data: { ...record, performanceId: toDisplayId(record.sequenceNumber) },
    };
  }

  async analyze(performanceId: string, requesterId: string) {
    const seq = parseDisplayId(performanceId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-5001',
        message: 'Performance not found',
      });
    }
    if (record.singerId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-5002', message: 'You are not the owner of this performance' });
    }

    const cfg = {
      apiKey: this.config.get<string>('gemini.apiKey'),
      model: this.config.get<string>('gemini.model'),
    };

    if (isGeminiConfigured(cfg)) {
      const filename = record.audioUrl.replace(/^\/uploads\//, '');
      const audioFilePath = join(UPLOADS_ROOT, filename);
      const mimeType = AUDIO_EXT_TO_MIME[extname(filename).toLowerCase()];

      if (mimeType) {
        const prompt =
          'Analyze the attached singing performance audio and score it on pitch accuracy, ' +
          'clarity of vocal delivery, rhythmic timing, and overall performance quality. ' +
          'Respond with strict JSON only, no markdown fences, matching exactly this shape: ' +
          '{"pitchScore": 92, "clarityScore": 90, "rhythmScore": 88, "overallScore": 90}. ' +
          'Each field is an integer percentage score from 0 to 100.';

        const result = await generateFromAudio<GeminiPerformanceAnalysisResult>(
          cfg,
          prompt,
          audioFilePath,
          mimeType,
          isGeminiPerformanceAnalysisResult,
        );

        if (result) {
          await this.repo.updateScores(record.id, result);
          return {
            status: 'SUCCESS',
            message: 'Performance analyzed',
            data: {
              pitch: result.pitchScore,
              clarity: result.clarityScore,
              rhythm: result.rhythmScore,
              overall: result.overallScore,
              source: 'gemini' as const,
            },
          };
        }
      } else {
        this.logger.warn(`analyze: no known mime type for audio file extension of ${filename}, skipping Gemini audio analysis`);
      }
    }

    // Unconfigured, or the Gemini call failed/returned a shape mismatch: do
    // not persist the sample numbers as if they were real scores — the DB
    // must reflect that no real analysis happened.
    await this.repo.updateScores(record.id, {
      pitchScore: null,
      clarityScore: null,
      rhythmScore: null,
      overallScore: null,
    });
    return {
      status: 'SUCCESS',
      message: 'Performance analyzed',
      data: { pitch: 92, clarity: 90, rhythm: 88, overall: 90, source: 'sample' as const },
    };
  }
}
