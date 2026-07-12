import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowController } from './follow.controller';
import { FollowRepository } from './follow.repository';
import { FollowService } from './follow.service';

@Module({
  controllers: [FollowController],
  providers: [FollowService, FollowRepository, PrismaService],
  exports: [FollowRepository],
})
export class FollowModule {}
