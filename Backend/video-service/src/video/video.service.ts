import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateJson, isGeminiConfigured } from '../shared/gemini.client';
import { postInternal } from '../shared/internal-http.client';
import { CreateVideoProjectDto } from './dto/create-video-project.dto';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto';
import { VideoRepository } from './video.repository';

export interface GeneratedStoryboardShot {
  shot: number;
  description: string;
  duration: number;
}

export interface GeneratedStoryboardResult {
  songId: string;
  shots: GeneratedStoryboardShot[];
}

function isGeneratedStoryboardResult(value: unknown): value is GeneratedStoryboardResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const shots = (value as { shots?: unknown }).shots;
  if (!Array.isArray(shots) || shots.length === 0) {
    return false;
  }
  return shots.every(
    (item) =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as { shot?: unknown }).shot === 'number' &&
      typeof (item as { description?: unknown }).description === 'string' &&
      typeof (item as { duration?: unknown }).duration === 'number',
  );
}

function toVideoProjectDisplayId(seq: number): string {
  return 'VPR' + (4000 + seq).toString();
}

function toVideoDisplayId(seq: number): string {
  return 'VID' + (1000 + seq).toString();
}

function parseVideoDisplayId(videoId: string): number {
  const seq = parseInt(videoId.replace('VID', ''), 10) - 1000;
  if (isNaN(seq)) {
    // NaN would reach Prisma as an invalid filter and surface as a 500.
    throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-6001', message: 'Video not found' });
  }
  return seq;
}

@Injectable()
export class VideoService {
  constructor(
    private readonly repo: VideoRepository,
    private readonly config: ConfigService,
  ) {}

  async createVideoProject(directorId: string, directorUserId: string, dto: CreateVideoProjectDto) {
    const project = await this.repo.createVideoProject(directorId, directorUserId, dto);
    return {
      status: 'SUCCESS',
      message: 'Video project created',
      data: {
        videoProjectId: toVideoProjectDisplayId(project.sequenceNumber),
        status: project.status,
      },
    };
  }

  async uploadVideo(uploaderId: string, uploaderUserId: string, filename: string, kind?: 'MOOD_BOARD') {
    const video = await this.repo.createVideo(uploaderId, uploaderUserId, `/uploads/${filename}`);
    // Mood-board images are uploaded through this same endpoint (DirectorStudioScreen)
    // but aren't videos, so they shouldn't produce a "New video uploaded" feed post.
    if (kind !== 'MOOD_BOARD') {
      postInternal(`${this.config.get<string>('feedService.url')}/internal/feed-items`, this.config.get<string>('internal.secret'), {
        type: 'VIDEO',
        sourceId: toVideoDisplayId(video.sequenceNumber),
        actorUserId: uploaderUserId,
        title: 'New video uploaded',
      }).catch(() => {});
    }
    return {
      status: 'SUCCESS',
      message: 'Video uploaded',
      data: {
        videoId: toVideoDisplayId(video.sequenceNumber),
        status: video.status,
      },
    };
  }

  async getVideoById(videoId: string, requesterUserId: string) {
    const seq = parseVideoDisplayId(videoId);
    const record = await this.repo.findVideoBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-6001',
        message: 'Video not found',
      });
    }
    if (record.uploaderUserId !== requesterUserId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-6002', message: 'You are not the owner of this video' });
    }
    return {
      status: 'SUCCESS',
      message: 'Video retrieved',
      data: { ...record, videoId: toVideoDisplayId(record.sequenceNumber) },
    };
  }

  async getOwner(videoId: string) {
    const seq = parseVideoDisplayId(videoId);
    const record = await this.repo.findVideoBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-6001',
        message: 'Video not found',
      });
    }
    return {
      status: 'SUCCESS',
      message: 'Owner retrieved',
      data: { ownerUserId: record.uploaderUserId },
    };
  }

  async generateStoryboard(dto: GenerateStoryboardDto) {
    const cfg = {
      apiKey: this.config.get<string>('gemini.apiKey'),
      model: this.config.get<string>('gemini.model'),
    };

    if (isGeminiConfigured(cfg)) {
      const prompt =
        `Create a music video storyboard with about 5 shots for the song with id "${dto.songId}". ` +
        'Respond with strict JSON only, no markdown fences, matching exactly this shape: ' +
        '{"songId": "...", "shots": [{"shot": 1, "description": "...", "duration": 4}]}. ' +
        'Each "description" should be a short, vivid description of the shot, and "duration" is the shot length in seconds.';

      const result = await generateJson<GeneratedStoryboardResult>(cfg, prompt, isGeneratedStoryboardResult);
      if (result) {
        return {
          status: 'SUCCESS',
          message: 'Storyboard generated',
          data: { songId: dto.songId, shots: result.shots, source: 'gemini' as const },
        };
      }
    }

    return {
      status: 'SUCCESS',
      message: 'Storyboard generated',
      data: {
        songId: dto.songId,
        shots: [
          { shot: 1, description: '[Sample] Opening wide shot of landscape', duration: 4 },
          { shot: 2, description: '[Sample] Close-up of singer performing', duration: 3 },
          { shot: 3, description: '[Sample] Montage of emotional moments', duration: 5 },
          { shot: 4, description: '[Sample] Group ensemble scene', duration: 4 },
          { shot: 5, description: '[Sample] Closing aerial shot', duration: 3 },
        ],
        source: 'sample' as const,
      },
    };
  }
}
