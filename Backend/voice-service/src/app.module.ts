import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import configuration from './config/configuration';
import { PerformanceModule } from './performance/performance.module';
import { UPLOADS_ROOT } from './shared/uploads-path';

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
    PerformanceModule,
  ],
})
export class AppModule {}
