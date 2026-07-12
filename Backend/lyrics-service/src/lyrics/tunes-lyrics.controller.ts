import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { LyricsService } from './lyrics.service';

@Controller('tunes')
export class TuneLyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Get(':tuneId/lyrics')
  @HttpCode(HttpStatus.OK)
  listForTune(
    @Param('tuneId') tuneId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.lyricsService.listForTune(tuneId, parseInt(page, 10), parseInt(pageSize, 10));
  }
}
