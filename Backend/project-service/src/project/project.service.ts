import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { ProjectRepository } from './project.repository';

function toDisplayId(seq: number): string {
  return 'PRJ' + (5000 + seq).toString();
}

function parseDisplayId(projectId: string): number {
  return parseInt(projectId.replace('PRJ', ''), 10) - 5000;
}

@Injectable()
export class ProjectService {
  constructor(private readonly repo: ProjectRepository) {}

  async create(ownerId: string, ownerUserId: string, dto: CreateProjectDto) {
    const project = await this.repo.create(ownerId, ownerUserId, dto);
    return {
      status: 'SUCCESS',
      message: 'Project created',
      data: {
        projectId: toDisplayId(project.sequenceNumber),
        status: project.status,
      },
    };
  }

  async invite(projectId: string, requesterId: string, dto: InviteCollaboratorDto) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    if (project.ownerId !== requesterId) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-7002', message: 'Only the project owner can invite collaborators' });
    }
    await this.repo.addMember(project.id, dto.userId, dto.role);
    return {
      status: 'SUCCESS',
      message: 'Collaborator invited',
      data: { projectId, userId: dto.userId, role: dto.role, inviteStatus: 'PENDING' },
    };
  }

  async getMembers(projectId: string) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    return {
      status: 'SUCCESS',
      message: 'Members retrieved',
      data: {
        projectId,
        members: project.members.map((m) => ({
          userId: m.userDisplayId,
          role: m.role,
          inviteStatus: m.inviteStatus,
        })),
      },
    };
  }

  async getFiles(projectId: string) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    return {
      status: 'SUCCESS',
      message: 'Files retrieved',
      data: { projectId, files: [] },
    };
  }
}
