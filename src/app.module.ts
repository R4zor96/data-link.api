import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // O '127.0.0.1'
      port: 3306,
      username: 'root',
      password: '', // Sin contraseña
      database: 'dbm', // El nombre de la BD del archivo .sql
      entities: [], // Lo dejamos vacío por ahora, ya que usamos consultas SQL directas
      synchronize: false, // ¡MUY IMPORTANTE! En 'false' para no modificar tu BD existente
    }),
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// src/app.module.ts