// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common'; // Añade Param y ParseIntPipe
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis-generales')
  getKpisGenerales(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getKpisGenerales(filters);
  }

  @Get('ubicaciones')
  getUbicaciones(@Query() filters: DashboardQueryDto) {
    return this.dashboardService.getUbicaciones(filters);
  }

  // --- NUEVA RUTA ---
  @Get('question-results/:id_pregunta')
  getQuestionResults(
    @Param('id_pregunta', ParseIntPipe) idPregunta: number, // Obtiene el ID de la URL
    @Query() filters: DashboardQueryDto,                   // Obtiene los filtros ?id_municipio=...
  ) {
    return this.dashboardService.getQuestionResults(idPregunta, filters);
  }
}
