// src/dashboard/dto/dashboard-query.dto.ts

import { IsOptional, IsNumberString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsNumberString()
  id_distrito_federal?: string;

  @IsOptional()
  @IsNumberString()
  id_distrito_local?: string;

  @IsOptional()
  @IsNumberString()
  id_municipio?: string;
}