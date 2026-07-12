import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStrategy } from '../auth/jwt.strategy';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { FollowModule } from '../follow/follow.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
  imports: [PassportModule, FollowModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileRepository,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
})
export class ProfileModule {}
