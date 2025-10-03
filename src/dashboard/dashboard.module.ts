import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// src/dashboard/dashboard.module.ts

@Module({
  imports: [
    // Si usas entidades de TypeORM, impórtalas aquí.
    // Por ahora, como usaremos consultas directas, no es necesario.
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}