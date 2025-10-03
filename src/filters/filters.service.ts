// src/filters/filters.service.ts

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class FiltersService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getDistritosFederales() {
    // Usamos 'AS' para que los nombres de las columnas coincidan
    // con la interfaz 'Region' de Angular (id, nombre).
    return this.dataSource.query(`
      SELECT 
        id_distrito_federal AS id, 
        nombre_distrito_federal AS nombre 
      FROM distritofederal 
      ORDER BY nombre_distrito_federal ASC;
    `);
  }

  async getDistritosLocales() {
    return this.dataSource.query(`
      SELECT 
        id_distrito_local AS id, 
        nombre_distrito_local AS nombre 
      FROM distritolocal 
      ORDER BY nombre_distrito_local ASC;
    `);
  }

  async getMunicipios() {
    return this.dataSource.query(`
      SELECT 
        id_municipio AS id, 
        nombre_municipio AS nombre 
      FROM municipio 
      ORDER BY nombre_municipio ASC;
    `);
  }
}