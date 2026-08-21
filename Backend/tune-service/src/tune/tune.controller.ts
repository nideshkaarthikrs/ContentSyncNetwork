import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateTuneDto } from './dto/create-tune.dto';
import { TuneService } from './tune.service';

@Controller('tunes')
export class TuneController {
  constructor(private readonly tuneService: TuneService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('audio', {
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
          return cb(new BadRequestException({ status: 'ERROR', errorCode: 'CSN-3004', message: 'File must be an audio type' }), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateTuneDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException({ status: 'ERROR', errorCode: 'CSN-3003', message: 'Audio file is required' });
    }
    return this.tuneService.create(req.user.userId, dto, file.filename);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyTunes(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.tuneService.getMyTunes(req.user.userId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Get(':tuneId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getTune(@Param('tuneId') tuneId: string) {
    return this.tuneService.getTune(tuneId);
  }

  @Delete(':tuneId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  deleteTune(@Param('tuneId') tuneId: string, @Request() req) {
    return this.tuneService.deleteTune(tuneId, req.user.userId);
  }

  @Post(':tuneId/analyze')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  analyzeTune(@Param('tuneId') tuneId: string, @Request() req) {
    return this.tuneService.analyzeTune(tuneId, req.user.userId);
  }
}
