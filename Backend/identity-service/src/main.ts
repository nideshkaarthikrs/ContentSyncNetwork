import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Only nginx (Backend/nginx/nginx.conf) ever talks to this service
  // directly, so trust its X-Forwarded-For -- needed for CustomThrottlerGuard
  // (src/auth/custom-throttler.guard.ts) and req.ip generally to reflect the
  // real client instead of the gateway's container IP.
  app.set('trust proxy', 1);

  app.enableCors({ origin: true }); // dev: mobile app has no meaningful browser Origin; harden via CORS_ORIGIN env before real deployment

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3001;

  await app.listen(port);
  console.log(`identity-service running on port ${port}`);
}

bootstrap();
