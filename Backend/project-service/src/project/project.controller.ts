import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  getMyProjects(@Request() req, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.projectService.getMyProjects(req.user.id, req.user.userId, parseInt(page, 10), parseInt(limit, 10));
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
  getMembers(@Param('projectId') projectId: string) {
    return this.projectService.getMembers(projectId);
  }

  @Get(':projectId/files')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getFiles(@Param('projectId') projectId: string) {
    return this.projectService.getFiles(projectId);
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
