// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis-generales')
  getKpisGenerales(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getKpisGenerales(filters);
  }

  @Get('graficos-demograficos')
  getGraficosDemograficos(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getGraficosDemograficos(filters);
  }
  
  @Get('preferencias')
  getPreferencias(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getPreferencias(filters);
  }

  @Get('ubicaciones')
  getUbicaciones(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getUbicaciones(filters);
  }
}
