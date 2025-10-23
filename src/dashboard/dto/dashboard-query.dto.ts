import { IsOptional, IsNumberString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsNumberString()
  id_estado?: string; // Nuevo

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
  id_seccion?: string; // Nuevo

  @IsOptional()
  @IsNumberString()
  id_comunidad?: string; // Nuevo
}