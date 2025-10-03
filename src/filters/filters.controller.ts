// src/filters/filters.controller.ts

import { Controller, Get } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('distritos-federales')
  getDistritosFederales() {
    return this.filtersService.getDistritosFederales();
  }

  @Get('distritos-locales')
  getDistritosLocales() {
    return this.filtersService.getDistritosLocales();
  }

  @Get('municipios')
  getMunicipios() {
    return this.filtersService.getMunicipios();
  }
}