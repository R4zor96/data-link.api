// src/main.ts (en tu proyecto de NestJS)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 AÑADE ESTA LÍNEA AQUÍ 👇
  app.enableCors({
    origin: 'http://localhost:4200', // Permite peticiones SÓLO desde tu app de Angular
  });

  await app.listen(3000);
}
bootstrap();