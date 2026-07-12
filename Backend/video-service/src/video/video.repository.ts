import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoProjectDto } from './dto/create-video-project.dto';

@Injectable()
export class VideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVideoProject(directorId: string, directorUserId: string, dto: CreateVideoProjectDto) {
    return this.prisma.videoProject.create({
      data: { songId: dto.songId, title: dto.title, directorId, directorUserId },
    });
  }

  async createVideo(uploaderId: string, uploaderUserId: string, videoUrl: string, videoProjectId?: string) {
    return this.prisma.video.create({
      data: { uploaderId, uploaderUserId, videoUrl, videoProjectId: videoProjectId ?? null },
    });
  }

  async findVideoBySequenceNumber(seq: number) {
    return this.prisma.video.findFirst({
      where: { sequenceNumber: seq },
      include: { videoProject: true },
    });
  }
}
