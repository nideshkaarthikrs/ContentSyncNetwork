import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStrategy } from '../auth/jwt.strategy';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InternalTuneController } from './internal-tune.controller';
import { TuneController } from './tune.controller';
import { TuneRepository } from './tune.repository';
import { TuneService } from './tune.service';

@Module({
  imports: [PassportModule],
  controllers: [TuneController, InternalTuneController],
  providers: [TuneService, TuneRepository, PrismaService, JwtStrategy, JwtAuthGuard, InternalAuthGuard],
})
export class TuneModule {}
