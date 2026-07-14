import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { InternalProjectController } from './internal-project.controller';
import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';

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
  controllers: [ProjectController, InternalProjectController],
  providers: [ProjectService, ProjectRepository, PrismaService, JwtStrategy, InternalAuthGuard],
})
export class ProjectModule {}
