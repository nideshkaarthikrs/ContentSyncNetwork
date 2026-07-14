import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { FeedController } from './feed.controller';
import { FeedRepository } from './feed.repository';
import { FeedService } from './feed.service';
import { InternalFeedController } from './internal-feed.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FeedController, InternalFeedController],
  providers: [FeedService, FeedRepository, PrismaService, JwtStrategy],
})
export class FeedModule {}
