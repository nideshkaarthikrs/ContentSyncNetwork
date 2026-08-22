import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AiAssistantController } from './ai-assistant.controller';
import { AiLyricsController } from './ai-lyrics.controller';
import { AssistantService } from './assistant.service';
import { LyricsController } from './lyrics.controller';
import { LyricsRepository } from './lyrics.repository';
import { LyricsService } from './lyrics.service';
import { TuneLyricsController } from './tunes-lyrics.controller';

@Module({
  imports: [PassportModule],
  controllers: [LyricsController, TuneLyricsController, AiLyricsController, AiAssistantController],
  providers: [LyricsService, AssistantService, LyricsRepository, PrismaService, JwtStrategy, JwtAuthGuard],
})
export class LyricsModule {}
