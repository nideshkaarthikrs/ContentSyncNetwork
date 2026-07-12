import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTuneDto } from './dto/create-tune.dto';

@Injectable()
export class TuneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateTuneDto, audioUrl: string) {
    return this.prisma.tune.create({
      data: { ownerId, audioUrl, ...dto },
    });
  }

  async findBySequenceNumber(seq: number) {
    return this.prisma.tune.findFirst({ where: { sequenceNumber: seq } });
  }

  async findByOwner(ownerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [tunes, total] = await Promise.all([
      this.prisma.tune.findMany({ where: { ownerId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.tune.count({ where: { ownerId } }),
    ]);
    return { tunes, total };
  }

  async delete(id: string) {
    return this.prisma.tune.delete({ where: { id } });
  }
}
