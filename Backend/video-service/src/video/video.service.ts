import { Injectable, NotFoundException } from '@nestjs/common';
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
  return parseInt(videoId.replace('VID', ''), 10) - 1000;
}

@Injectable()
export class VideoService {
  constructor(private readonly repo: VideoRepository) {}

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
