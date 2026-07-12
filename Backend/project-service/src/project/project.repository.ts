import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, ownerUserId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { projectName: dto.projectName, ownerId, ownerUserId },
    });
  }

  async findBySequenceNumber(seq: number) {
    return this.prisma.project.findFirst({
      where: { sequenceNumber: seq },
      include: { members: true },
    });
  }

  async addMember(projectId: string, userDisplayId: string, role: string) {
    return this.prisma.projectMember.upsert({
      where: {
        projectId_userDisplayId: { projectId, userDisplayId },
      },
      update: { role, inviteStatus: 'PENDING' },
      create: { projectId, userDisplayId, role },
    });
  }
}
