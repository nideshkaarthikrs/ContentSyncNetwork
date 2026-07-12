import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLyricsDto } from './dto/create-lyrics.dto';
import { UpdateLyricsDto } from './dto/update-lyrics.dto';

@Injectable()
export class LyricsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreateLyricsDto) {
    return this.prisma.lyrics.create({
      data: {
        tuneId: dto.tuneId,
        authorId,
        title: dto.title,
        language: dto.language,
        lyricsText: dto.lyrics,
      },
    });
  }

  async findBySequenceNumber(seq: number) {
    return this.prisma.lyrics.findFirst({ where: { sequenceNumber: seq } });
  }

  async update(id: string, dto: UpdateLyricsDto) {
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.lyrics !== undefined) data.lyricsText = dto.lyrics;
    return this.prisma.lyrics.update({ where: { id }, data });
  }

  async setStatus(id: string, status: string) {
    return this.prisma.lyrics.update({ where: { id }, data: { status } });
  }

  async findByTuneId(tuneId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [lyrics, total] = await Promise.all([
      this.prisma.lyrics.findMany({
        where: { tuneId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lyrics.count({ where: { tuneId } }),
    ]);
    return { lyrics, total };
  }
}
