// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { FiltersModule } from './filters/filters.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 1. Configura el módulo para leer el archivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Lo hace disponible en toda la aplicación
    }),

    // 2. Configura la conexión a la BD de forma segura
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        // 👇 Lee el puerto como string y conviértelo a número
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10), // Añade un valor por defecto
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [],
        synchronize: false,
      }),
    }),

    // Tus otros módulos
    DashboardModule,
    FiltersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
