import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common'; // Asegúrate de importar Param y ParseIntPipe
import { FiltersService } from './filters.service';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('estados')
  getEstados() {
    return this.filtersService.getEstados();
  }

  @Get('distritos-federales')
  getDistritosFederales(@Query('id_estado') idEstado?: string) {
    // Acepta id_estado
    return this.filtersService.getDistritosFederales(idEstado);
  }

  @Get('distritos-locales')
  getDistritosLocales(@Query('id_distrito_federal') idDF?: string) {
    return this.filtersService.getDistritosLocales(idDF);
  }

  @Get('municipios')
  getMunicipios(@Query('id_distrito_local') idDL?: string) {
    return this.filtersService.getMunicipios(idDL);
  }

  @Get('secciones') // Nueva ruta
  getSecciones(@Query('id_municipio') idMunicipio?: string) {
    return this.filtersService.getSecciones(idMunicipio);
  }

  @Get('comunidades') // Nueva ruta
  getComunidades(@Query('id_seccion') idSeccion?: string) {
    return this.filtersService.getComunidades(idSeccion);
  }

  @Get('questions')
  getQuestions(/* Podrías añadir @Query('id_encuesta') si necesitas filtrar */) {
    // Pasamos un ID de encuesta fijo por ahora
    return this.filtersService.getQuestions(9);
  }
  // --- RUTA NUEVA ---
  @Get('options/:id_pregunta')
  getOptionsForQuestion(
    @Param('id_pregunta', ParseIntPipe) idPregunta: number,
  ) {
    return this.filtersService.getOptionsForQuestion(idPregunta);
  }
}
