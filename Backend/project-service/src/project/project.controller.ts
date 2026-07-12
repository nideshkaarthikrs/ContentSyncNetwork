import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
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
}
