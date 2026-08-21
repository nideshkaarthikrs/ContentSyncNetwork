import { Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clampPagination } from '../shared/pagination.helper';
import { LyricsService } from './lyrics.service';

@Controller('tunes')
export class TuneLyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Get(':tuneId/lyrics')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  listForTune(
    @Param('tuneId') tuneId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.lyricsService.listForTune(tuneId, clamped.page, clamped.pageSize);
  }
}
