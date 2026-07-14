import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { ProjectService } from './project.service';

@Controller('internal/projects')
export class InternalProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get(':projectId/membership')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMembership(
    @Param('projectId') projectId: string,
    @Query('userId') userId: string,
    @Query('userDisplayId') userDisplayId: string,
  ) {
    const isMember = await this.projectService.checkMembership(projectId, userId, userDisplayId);
    return {
      status: 'SUCCESS',
      message: 'Membership checked',
      data: { isMember },
    };
  }
}
