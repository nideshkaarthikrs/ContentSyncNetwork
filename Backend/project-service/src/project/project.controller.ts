import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clampPagination } from '../shared/pagination.helper';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProjectDto, @Request() req) {
    return this.projectService.create(req.user.id, req.user.userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyProjects(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const clamped = clampPagination(page, limit);
    return this.projectService.getMyProjects(req.user.id, req.user.userId, clamped.page, clamped.pageSize);
  }

  @Post(':projectId/invite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  invite(
    @Param('projectId') projectId: string,
    @Body() dto: InviteCollaboratorDto,
    @Request() req,
  ) {
    return this.projectService.invite(projectId, req.user.id, dto);
  }

  @Patch(':projectId/invite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  respondToInvite(
    @Param('projectId') projectId: string,
    @Body() dto: RespondInviteDto,
    @Request() req,
  ) {
    return this.projectService.respondToInvite(projectId, req.user.id, req.user.userId, dto);
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMembers(@Param('projectId') projectId: string, @Request() req) {
    return this.projectService.getMembers(projectId, req.user.id, req.user.userId);
  }

  @Get(':projectId/files')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getFiles(@Param('projectId') projectId: string, @Request() req) {
    return this.projectService.getFiles(projectId, req.user.id, req.user.userId);
  }

  @Post(':projectId/files')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
      // Project files are intentionally not type-restricted, except for types
      // that would execute same-origin when served back by ServeStaticModule.
      fileFilter: (_req, file, cb) => {
        const dangerous = ['text/html', 'application/xhtml+xml', 'image/svg+xml'];
        if (dangerous.includes(file.mimetype)) {
          return cb(new BadRequestException({ status: 'ERROR', errorCode: 'CSN-7006', message: 'This file type is not allowed' }), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException({ status: 'ERROR', errorCode: 'CSN-7004', message: 'File is required' });
    }
    return this.projectService.uploadFile(projectId, req.user.id, req.user.userId, file);
  }
}
