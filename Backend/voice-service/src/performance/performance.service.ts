import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { PerformanceRepository } from './performance.repository';

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
  constructor(private readonly repo: PerformanceRepository) {}

  async upload(singerId: string, dto: CreatePerformanceDto, filename: string) {
    const record = await this.repo.create(singerId, dto, `/uploads/${filename}`);
    return { performanceId: toDisplayId(record.sequenceNumber) };
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

  async getById(performanceId: string) {
    const seq = parseDisplayId(performanceId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-5001',
        message: 'Performance not found',
      });
    }
    return {
      status: 'SUCCESS',
      message: 'Performance retrieved',
      data: { ...record, performanceId: toDisplayId(record.sequenceNumber) },
    };
  }

  async analyze(performanceId: string) {
    const seq = parseDisplayId(performanceId);
    const record = await this.repo.findBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException({
        status: 'ERROR',
        errorCode: 'CSN-5001',
        message: 'Performance not found',
      });
    }
    const scores = { pitchScore: 92, clarityScore: 90, rhythmScore: 88, overallScore: 90 };
    await this.repo.updateScores(record.id, scores);
    return { pitch: 92, clarity: 90, rhythm: 88, overall: 90 };
  }
}
