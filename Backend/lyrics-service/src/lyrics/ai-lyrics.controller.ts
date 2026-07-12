import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { LyricsService } from './lyrics.service';

@Controller('ai/lyrics')
export class AiLyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  generate(@Body() dto: GenerateLyricsDto) {
    return this.lyricsService.generate(dto);
  }
}
