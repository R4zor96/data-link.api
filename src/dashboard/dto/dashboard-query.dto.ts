import { IsOptional, IsNumberString, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Helper para transformar el string JSON de los filtros en un objeto.
 * Si el string no es un JSON válido, devuelve el string original para que falle la validación.
 */
const TransformJsonString = () => Transform(({ value }) => {
  if (typeof value !== 'string' || value === '') {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return value; // Devuelve el string original si falla el parseo
  }
});

/**
 * Define la estructura de los parámetros de consulta (query params)
 * que se pueden recibir en los endpoints del dashboard.
 */
export class DashboardQueryDto {
  // --- Filtros Geográficos ---
  @IsOptional() @IsNumberString() id_estado?: string;
  @IsOptional() @IsNumberString() id_distrito_federal?: string;
  @IsOptional() @IsNumberString() id_distrito_local?: string;
  @IsOptional() @IsNumberString() id_municipio?: string;
  @IsOptional() @IsNumberString() id_seccion?: string;
  @IsOptional() @IsNumberString() id_comunidad?: string;

  // --- Filtros Dinámicos de Respuestas ---
  
  @IsOptional()
  @TransformJsonString() // 1. Transforma el string JSON en un objeto
  @IsObject()           // 2. Valida que el resultado SEA un objeto
  answerFilters?: { [questionId: string]: string[] };
}