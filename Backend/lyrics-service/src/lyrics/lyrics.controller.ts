import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLyricsDto } from './dto/create-lyrics.dto';
import { UpdateLyricsDto } from './dto/update-lyrics.dto';
import { LyricsService } from './lyrics.service';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: CreateLyricsDto, @Request() req) {
    return this.lyricsService.submit(req.user.userId, dto);
  }

  @Put(':lyricsId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  update(@Param('lyricsId') lyricsId: string, @Body() dto: UpdateLyricsDto, @Request() req) {
    return this.lyricsService.update(lyricsId, req.user.userId, dto);
  }

  @Get(':lyricsId')
  @HttpCode(HttpStatus.OK)
  getById(@Param('lyricsId') lyricsId: string) {
    return this.lyricsService.getById(lyricsId);
  }

  @Post(':lyricsId/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  approve(@Param('lyricsId') lyricsId: string, @Request() req) {
    return this.lyricsService.approve(lyricsId, req.user.roles);
  }
}
