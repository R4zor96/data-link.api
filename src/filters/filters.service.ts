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

  async getDistritosLocales(idDF?: string) {
    let whereClause = '';
    if (idDF && idDF !== 'all') {
      whereClause = `WHERE id_distrito_federal = ${idDF}`;
    }

    return this.dataSource.query(`
      SELECT 
        id_distrito_local AS id, 
        nombre_distrito_local AS nombre 
      FROM distritolocal 
      ${whereClause}
      ORDER BY CAST(SUBSTRING_INDEX(nombre_distrito_local, ' ', -1) AS UNSIGNED) ASC;
    `);
  }

  async getMunicipios(idDL?: string) {
    let whereClause = '';
    if (idDL && idDL !== 'all') {
      whereClause = `WHERE id_distrito_local = ${idDL}`;
    }

    return this.dataSource.query(`
      SELECT 
        id_municipio AS id, 
        nombre_municipio AS nombre 
      FROM municipio
      ${whereClause}
      ORDER BY nombre_municipio ASC;
    `);
  }
}
