import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { postInternal } from '../shared/internal-http.client';
import { CreateVideoProjectDto } from './dto/create-video-project.dto';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto';
import { VideoRepository } from './video.repository';

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

  async uploadVideo(uploaderId: string, uploaderUserId: string, filename: string) {
    const video = await this.repo.createVideo(uploaderId, uploaderUserId, `/uploads/${filename}`);
    postInternal(`${this.config.get<string>('feedService.url')}/internal/feed-items`, this.config.get<string>('internal.secret'), {
      type: 'VIDEO',
      sourceId: toVideoDisplayId(video.sequenceNumber),
      actorUserId: uploaderUserId,
      title: 'New video uploaded',
    }).catch(() => {});
    return {
      status: 'SUCCESS',
      message: 'Video uploaded',
      data: {
        videoId: toVideoDisplayId(video.sequenceNumber),
        status: video.status,
      },
    };
  }

  async getVideoById(videoId: string) {
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

  generateStoryboard(dto: GenerateStoryboardDto) {
    return {
      status: 'SUCCESS',
      message: 'Storyboard generated',
      data: {
        songId: dto.songId,
        shots: [
          { shot: 1, description: 'Opening wide shot of landscape', duration: 4 },
          { shot: 2, description: 'Close-up of singer performing', duration: 3 },
          { shot: 3, description: 'Montage of emotional moments', duration: 5 },
          { shot: 4, description: 'Group ensemble scene', duration: 4 },
          { shot: 5, description: 'Closing aerial shot', duration: 3 },
        ],
      },
    };
  }
}
