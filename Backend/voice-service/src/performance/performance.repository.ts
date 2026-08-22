import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';

@Injectable()
export class PerformanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(singerId: string, dto: CreatePerformanceDto, audioUrl: string) {
    return this.prisma.performance.create({
      data: {
        tuneId: dto.tuneId,
        lyricsId: dto.lyricsId,
        singerId,
        audioUrl,
      },
    });
  }

  async findBySequenceNumber(seq: number) {
    return this.prisma.performance.findFirst({ where: { sequenceNumber: seq } });
  }

  async findBySinger(singerId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [performances, total] = await Promise.all([
      this.prisma.performance.findMany({
        where: { singerId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.performance.count({ where: { singerId } }),
    ]);
    return { performances, total };
  }

  async updateScores(
    id: string,
    scores: {
      pitchScore: number | null;
      clarityScore: number | null;
      rhythmScore: number | null;
      overallScore: number | null;
    },
  ) {
    return this.prisma.performance.update({
      where: { id },
      data: { ...scores, status: 'PUBLISHED' },
    });
  }
}
