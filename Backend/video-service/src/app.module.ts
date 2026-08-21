import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import configuration from './config/configuration';
import { UPLOADS_ROOT } from './shared/uploads-path';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_ROOT,
      serveRoot: '/uploads',
    }),
    VideoModule,
  ],
})
export class AppModule {}
