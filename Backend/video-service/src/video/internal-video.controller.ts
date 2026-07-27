import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { VideoService } from './video.service';

@Controller('internal/videos')
export class InternalVideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get(':videoId/owner')
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.OK)
  getOwner(@Param('videoId') videoId: string) {
    return this.videoService.getOwner(videoId);
  }
}
