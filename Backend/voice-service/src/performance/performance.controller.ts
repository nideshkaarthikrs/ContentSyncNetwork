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
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { PerformanceService } from './performance.service';

@Controller('performances')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

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
      limits: { fileSize: 30 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('audio/')) {
          return cb(new BadRequestException({ status: 'ERROR', errorCode: 'CSN-VOICE-002', message: 'File must be an audio type' }), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePerformanceDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException({ status: 'ERROR', errorCode: 'CSN-VOICE-001', message: 'Audio file is required' });
    }
    return this.performanceService.upload(req.user.userId, dto, file.filename);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyPerformances(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.performanceService.getMyPerformances(
      req.user.userId,
      clamped.page,
      clamped.pageSize,
    );
  }

  @Get(':performanceId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getById(@Param('performanceId') performanceId: string, @Request() req) {
    return this.performanceService.getById(performanceId, req.user.userId);
  }

  @Post(':performanceId/analyze')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  analyze(@Param('performanceId') performanceId: string, @Request() req) {
    return this.performanceService.analyze(performanceId, req.user.userId);
  }
}
