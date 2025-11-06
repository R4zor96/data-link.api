// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- CONFIGURACIÓN DE SWAGGER SOLO PARA NO-PRODUCCIÓN ---
  // Vercel define VERCEL_ENV como 'production' solo en el deploy de producción
  if (process.env.VERCEL_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API de MONKQI')
      .setDescription('Documentación interactiva de la API')
      .setVersion('1.0')
      .build();

    // 1. NO LA LLAMES 'document', llámala 'swaggerDocument'
    const swaggerDocument = SwaggerModule.createDocument(app, config);

    // 2. Ahora pasa 'swaggerDocument' al setup
    SwaggerModule.setup(
      'api-docs',
      app,
      swaggerDocument, // <-- Usa la variable con el nuevo nombre
      {
        customSiteTitle: 'MONKQI API - Preview',
        customCssUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-standalone-preset.js',
        ],
      },
    );
  }

  // Configuración de CORS
  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string>('CORS_ORIGINS');

  if (allowedOrigins) {
    const originsArray = allowedOrigins.split(',');
    app.enableCors({
      origin: originsArray,
    });
    console.log('CORS habilitado para:', originsArray);
  } else {
    console.warn(
      'Advertencia: No se encontró la variable CORS_ORIGINS en .env.',
    );
    app.enableCors({ origin: 'http://localhost:4200' });
  }

  await app.listen(3000);

  console.log(`🚀 Aplicación corriendo en el puerto 3000`);
}
bootstrap();
