import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Server running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();