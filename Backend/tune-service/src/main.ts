import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true }); // dev: mobile app has no meaningful browser Origin; harden via CORS_ORIGIN env before real deployment

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3003;

  await app.listen(port);
  console.log(`tune-service running on port ${port}`);
}

bootstrap();
