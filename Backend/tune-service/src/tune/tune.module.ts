import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { TuneController } from './tune.controller';
import { TuneRepository } from './tune.repository';
import { TuneService } from './tune.service';

@Module({
  imports: [PassportModule],
  controllers: [TuneController],
  providers: [TuneService, TuneRepository, PrismaService, JwtStrategy, JwtAuthGuard],
})
export class TuneModule {}
