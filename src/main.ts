// src/main.ts (en tu proyecto NestJS)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common'; // 👈 1. Asegúrate de importar ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 2. AÑADE ESTE BLOQUE COMPLETO 👇
  // Habilita la validación y transformación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // <-- Esta es la línea mágica que faltaba
    whitelist: true, // Opcional: elimina propiedades que no estén en el DTO
    transformOptions: {
      enableImplicitConversion: true, // Ayuda a convertir tipos
    },
  }));

  // 3. Tu configuración de CORS (está bien)
  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string>('CORS_ORIGINS');

  if (allowedOrigins) {
    const originsArray = allowedOrigins.split(',');
    app.enableCors({
      origin: originsArray,
    });
    console.log('CORS habilitado para:', originsArray);
  } else {
    console.warn('Advertencia: No se encontró la variable CORS_ORIGINS en .env.');
    app.enableCors({ origin: 'http://localhost:4200' }); 
  }

  await app.listen(3000);
}
bootstrap();