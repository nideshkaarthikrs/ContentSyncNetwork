import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVideoProjectDto } from './dto/create-video-project.dto';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto';
import { VideoService } from './video.service';

@Controller('video-projects')
export class VideoProjectController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVideoProjectDto, @Request() req) {
    return this.videoService.createVideoProject(req.user.id, req.user.userId, dto);
  }
}

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
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
  upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException({ status: 'ERROR', errorCode: 'CSN-VIDEO-001', message: 'Video file is required' });
    }
    return this.videoService.uploadVideo(req.user.id, req.user.userId, file.filename);
  }

  @Get(':videoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getById(@Param('videoId') videoId: string) {
    return this.videoService.getVideoById(videoId);
  }
}

@Controller('ai')
export class AiController {
  constructor(private readonly videoService: VideoService) {}

  @Post('storyboards')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  generateStoryboard(@Body() dto: GenerateStoryboardDto) {
    return this.videoService.generateStoryboard(dto);
  }
}
