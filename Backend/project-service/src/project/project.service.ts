import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { postInternal } from '../shared/internal-http.client';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { ProjectRepository } from './project.repository';

function toDisplayId(seq: number): string {
  return 'PRJ' + (5000 + seq).toString();
}

function parseDisplayId(projectId: string): number {
  const seq = parseInt(projectId.replace('PRJ', ''), 10) - 5000;
  if (isNaN(seq)) {
    // NaN would reach Prisma as an invalid filter and surface as a 500.
    throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
  }
  return seq;
}

function toFileDisplayId(seq: number): string {
  return 'PFL' + (14000 + seq).toString();
}

@Injectable()
export class ProjectService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly config: ConfigService,
  ) {}

  private isMember(
    project: { ownerId: string; members: { userDisplayId: string; inviteStatus: string }[] },
    requesterId: string,
    requesterUserId: string,
  ): boolean {
    const isOwner = project.ownerId === requesterId;
    const isAcceptedMember = project.members.some(
      (m) => m.userDisplayId === requesterUserId && m.inviteStatus === 'ACCEPTED',
    );
    return isOwner || isAcceptedMember;
  }

  async checkMembership(projectId: string, userId: string, userDisplayId: string): Promise<boolean> {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      return false;
    }
    return this.isMember(project, userId, userDisplayId);
  }

  async create(ownerId: string, ownerUserId: string, dto: CreateProjectDto) {
    const project = await this.repo.create(ownerId, ownerUserId, dto);
    postInternal(`${this.config.get<string>('feedService.url')}/internal/feed-items`, this.config.get<string>('internal.secret'), {
      type: 'PROJECT',
      sourceId: toDisplayId(project.sequenceNumber),
      actorUserId: ownerUserId,
      title: dto.projectName,
    }).catch(() => {});
    return {
      status: 'SUCCESS',
      message: 'Project created',
      data: {
        projectId: toDisplayId(project.sequenceNumber),
        status: project.status,
      },
    };
  }

  async getMyProjects(ownerId: string, memberDisplayId: string, page: number, limit: number) {
    const { projects, total } = await this.repo.findMine(ownerId, memberDisplayId, page, limit);
    return {
      status: 'SUCCESS',
      message: 'Projects retrieved',
      data: {
        projects: projects.map((p) => ({
          projectId: toDisplayId(p.sequenceNumber),
          projectName: p.projectName,
          status: p.status,
          role: p.ownerId === ownerId ? 'OWNER' : 'MEMBER',
          createdAt: p.createdAt,
        })),
        total,
        page,
        limit,
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
    postInternal(`${this.config.get<string>('notificationService.url')}/internal/notifications`, this.config.get<string>('internal.secret'), {
      recipientUserId: dto.userId,
      type: 'INVITE',
      title: `You've been invited to ${project.projectName}`,
      sourceId: projectId,
    }).catch(() => {});
    return {
      status: 'SUCCESS',
      message: 'Collaborator invited',
      data: { projectId, userId: dto.userId, role: dto.role, inviteStatus: 'PENDING' },
    };
  }

  async respondToInvite(projectId: string, requesterId: string, requesterUserId: string, dto: RespondInviteDto) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    const invite = project.members.find(
      (m) => m.userDisplayId === requesterUserId && m.inviteStatus === 'PENDING',
    );
    if (!invite) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-7005', message: 'You do not have a pending invite for this project' });
    }
    await this.repo.updateInviteStatus(project.id, requesterUserId, dto.status);
    return {
      status: 'SUCCESS',
      message: 'Invite response recorded',
      data: { projectId, userId: requesterUserId, inviteStatus: dto.status },
    };
  }

  async getMembers(projectId: string, requesterId: string, requesterUserId: string) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    if (!this.isMember(project, requesterId, requesterUserId)) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-7003', message: 'Only project members can view members' });
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

  async getFiles(projectId: string, requesterId: string, requesterUserId: string) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    if (!this.isMember(project, requesterId, requesterUserId)) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-7003', message: 'Only project members can view files' });
    }
    const files = await this.repo.findFiles(project.id);
    return {
      status: 'SUCCESS',
      message: 'Files retrieved',
      data: {
        projectId,
        files: files.map((f) => ({
          fileId: toFileDisplayId(f.sequenceNumber),
          filename: f.filename,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
          uploadedBy: f.uploaderUserId,
          createdAt: f.createdAt,
        })),
      },
    };
  }

  async uploadFile(
    projectId: string,
    requesterId: string,
    requesterUserId: string,
    file: { originalname: string; filename: string; size: number; mimetype: string },
  ) {
    const seq = parseDisplayId(projectId);
    const project = await this.repo.findBySequenceNumber(seq);
    if (!project) {
      throw new NotFoundException({ status: 'ERROR', errorCode: 'CSN-7001', message: 'Project not found' });
    }
    if (!this.isMember(project, requesterId, requesterUserId)) {
      throw new ForbiddenException({ status: 'ERROR', errorCode: 'CSN-7003', message: 'Only project members can upload files' });
    }
    const record = await this.repo.createFile(
      project.id,
      requesterId,
      requesterUserId,
      file.originalname,
      `/uploads/${file.filename}`,
      file.size,
      file.mimetype,
    );
    return {
      status: 'SUCCESS',
      message: 'File uploaded',
      data: {
        fileId: toFileDisplayId(record.sequenceNumber),
        filename: record.filename,
        fileUrl: record.fileUrl,
        createdAt: record.createdAt,
      },
    };
  }
}
