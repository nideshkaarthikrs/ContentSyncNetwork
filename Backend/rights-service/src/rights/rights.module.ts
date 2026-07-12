import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { CopyrightController } from './copyright.controller';
import { DrmController } from './drm.controller';
import { MarketplaceController } from './marketplace.controller';
import { RightsRepository } from './rights.repository';
import { RightsService } from './rights.service';

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
  controllers: [MarketplaceController, DrmController, CopyrightController],
  providers: [RightsService, RightsRepository, PrismaService, JwtStrategy],
})
export class RightsModule {}
