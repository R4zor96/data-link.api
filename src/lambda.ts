// src/lambda.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure as configureServerlessExpress } from '@vendia/serverless-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

let cachedServer;

// Esta función es la que llama AWS Lambda (handler)
async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    // 1. Configuración de ValidationPipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // 2. Configuración de Swagger
    // NOTA: Para producción en Lambda, debes decidir si SWAGGER debe estar aquí.
    // Si quieres que solo se habilite en DEV/STAGING, usa una variable de entorno como 'AWS_ENV'
    if (process.env.AWS_ENV !== 'production') {
      const stage = process.env.STAGE || 'dev'; // Usamos 'dev' como default
      const config = new DocumentBuilder()
        .setTitle('API de DATALINK')
        .setDescription('Documentación interactiva de la API')
        .setVersion('1.0')
        .addServer(`/${stage}`)
        .build();
      const swaggerDocument = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, swaggerDocument, {
        customSiteTitle: 'DATALINK API - Preview',
        customCssUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-standalone-preset.js',
        ],
      });
    }

    // 3. Configuración de CORS (Obteniendo de ConfigService)
    const configService = app.get(ConfigService);
    const allowedOrigins = configService.get<string>('CORS_ORIGINS');

    if (allowedOrigins) {
      const originsArray = allowedOrigins.split(',');
      app.enableCors({
        origin: originsArray,
      });
    } else {
      // Si no hay CORS_ORIGINS definido, puede que no se necesite CORS si solo es para uso interno.
      // Aquí se mantiene la advertencia original.
      console.warn(
        'Advertencia: No se encontró la variable CORS_ORIGINS en las variables de entorno de AWS Lambda.',
      );
    }
    
    // Inicializar y devolver el manejador (handler)
    await app.init();
    cachedServer = configureServerlessExpress({ 
        app: app.getHttpAdapter().getInstance() 
    });
  }

  return cachedServer;
}

// Exportar la función handler que usará AWS Lambda
export const handler = async (event, context) => {
  const server = await bootstrapServer();
  return server(event, context);
};