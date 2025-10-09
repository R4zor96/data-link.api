// src/filters/filters.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('distritos-federales')
  getDistritosFederales() {
    return this.filtersService.getDistritosFederales();
  }

  @Get('distritos-locales')
  getDistritosLocales(@Query('id_distrito_federal') idDF?: string) {
    return this.filtersService.getDistritosLocales(idDF);
  }

  @Get('municipios')
  getMunicipios(@Query('id_distrito_local') idDL?: string) {
    return this.filtersService.getMunicipios(idDL);
  }
}