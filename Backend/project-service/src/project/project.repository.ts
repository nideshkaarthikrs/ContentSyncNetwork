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

  async findMine(ownerId: string, memberDisplayId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { ownerId },
        { members: { some: { userDisplayId: memberDisplayId } } },
      ],
    };
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.project.count({ where }),
    ]);
    return { projects, total };
  }

  async findBySequenceNumber(seq: number) {
    return this.prisma.project.findFirst({
      where: { sequenceNumber: seq },
      include: { members: true },
    });
  }

  async addMember(projectId: string, userDisplayId: string, role: string) {
    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userDisplayId: { projectId, userDisplayId },
      },
    });
    if (existing?.inviteStatus === 'ACCEPTED') {
      return this.prisma.projectMember.update({
        where: {
          projectId_userDisplayId: { projectId, userDisplayId },
        },
        data: { role },
      });
    }
    return this.prisma.projectMember.upsert({
      where: {
        projectId_userDisplayId: { projectId, userDisplayId },
      },
      update: { role, inviteStatus: 'PENDING' },
      create: { projectId, userDisplayId, role },
    });
  }

  async updateInviteStatus(projectId: string, userDisplayId: string, status: string) {
    return this.prisma.projectMember.update({
      where: {
        projectId_userDisplayId: { projectId, userDisplayId },
      },
      data: { inviteStatus: status as any },
    });
  }

  async createFile(
    projectId: string,
    uploaderId: string,
    uploaderUserId: string,
    filename: string,
    fileUrl: string,
    fileSize?: number,
    mimeType?: string,
  ) {
    return this.prisma.projectFile.create({
      data: { projectId, uploaderId, uploaderUserId, filename, fileUrl, fileSize, mimeType },
    });
  }

  async findFiles(projectId: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
