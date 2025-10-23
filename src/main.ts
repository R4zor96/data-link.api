import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // 👈 Importa ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Configuración de CORS con variable de entorno 👇
  const configService = app.get(ConfigService); // Obtén el servicio de configuración
  const allowedOrigins = configService.get<string>('CORS_ORIGINS');

  if (allowedOrigins) {
    const originsArray = allowedOrigins.split(','); // Separa las URLs por coma
    app.enableCors({
      origin: originsArray, // Pasa el array de orígenes permitidos
    });
    console.log('CORS habilitado para:', originsArray); // Mensaje de confirmación
  } else {
    console.warn('Advertencia: No se encontró la variable CORS_ORIGINS en .env. CORS podría no estar configurado correctamente.');
    // Opcional: Habilitar un origen por defecto o solo localhost si no se encuentra
    app.enableCors({ origin: 'http://localhost:4200' }); 
  }

  await app.listen(3000);
}
bootstrap();
