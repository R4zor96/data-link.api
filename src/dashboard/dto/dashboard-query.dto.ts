import { IsOptional, IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Helper para transformar el string JSON de los filtros en un objeto.
 * Si el string no es un JSON válido, devuelve un objeto vacío.
 */
const TransformJsonString = () => Transform(({ value }) => {
  if (typeof value !== 'string' || value === '') {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return {}; // Devuelve objeto vacío si el parseo falla
  }
});

/**
 * Define la estructura de los parámetros de consulta (query params)
 * que se pueden recibir en los endpoints del dashboard.
 */
export class DashboardQueryDto {
  // --- Filtros Geográficos ---

  @IsOptional()
  @IsNumberString()
  id_estado?: string;

  @IsOptional()
  @IsNumberString()
  id_distrito_federal?: string;

  @IsOptional()
  @IsNumberString()
  id_distrito_local?: string;

  @IsOptional()
  @IsNumberString()
  id_municipio?: string;

  @IsOptional()
  @IsNumberString()
  id_seccion?: string;

  @IsOptional()
  @IsNumberString()
  id_comunidad?: string;

  // --- Filtros Dinámicos de Respuestas ---

  /**
   * Recibe un string codificado en JSON para los filtros de respuestas.
   * Ejemplo: '{"31":["126","127"],"32":["139"]}'
   * (Pregunta 31 con opciones 126 O 127) Y (Pregunta 32 con opción 139)
   */
  @IsOptional()
  @IsString() // Recibe un string desde la URL
  @TransformJsonString() // Transforma el string a un objeto
  answerFilters?: { [questionId: string]: string[] }; // Se convierte en: { "31": ["126", "127"], ... }
}