import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class FiltersService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getEstados() {
    // Devuelve Tlaxcala por ahora
    return this.dataSource.query(`
      SELECT id_estado AS id, nombre_estado AS nombre 
      FROM estado; 
    `);
  }

  async getDistritosFederales(idEstado?: string) {
    const params: any[] = [];
    let whereClause = '';
    // Filtra por estado si se proporciona un ID válido
    if (idEstado && idEstado !== 'all') {
      whereClause = `WHERE id_estado = ?`;
      params.push(idEstado);
    }
    return this.dataSource.query(`
      SELECT id_distrito_federal AS id, nombre_distrito_federal AS nombre 
      FROM distritofederal 
      ${whereClause}
      ORDER BY nombre_distrito_federal ASC;
    `, params);
  }

  async getDistritosLocales(idDF?: string) {
    const params: any[] = [];
    let whereClause = '';
    if (idDF && idDF !== 'all') {
      whereClause = `WHERE id_distrito_federal = ?`;
      params.push(idDF);
    }
    return this.dataSource.query(`
      SELECT id_distrito_local AS id, nombre_distrito_local AS nombre 
      FROM distritolocal 
      ${whereClause}
      ORDER BY CAST(SUBSTRING_INDEX(nombre_distrito_local, ' ', -1) AS UNSIGNED) ASC;
    `, params);
  }

  async getMunicipios(idDL?: string) {
    const params: any[] = [];
    let whereClause = '';
    if (idDL && idDL !== 'all') {
      whereClause = `WHERE id_distrito_local = ?`;
      params.push(idDL);
    }
    return this.dataSource.query(`
      SELECT id_municipio AS id, nombre_municipio AS nombre 
      FROM municipio
      ${whereClause}
      ORDER BY nombre_municipio ASC;
    `, params);
  }

  async getSecciones(idMunicipio?: string) {
    const params: any[] = [];
    let whereClause = '';
    if (idMunicipio && idMunicipio !== 'all') {
      whereClause = `WHERE id_municipio = ?`;
      params.push(idMunicipio);
    }
    return this.dataSource.query(`
      SELECT id_seccion AS id, nombre_seccion AS nombre 
      FROM seccion
      ${whereClause}
      ORDER BY CAST(nombre_seccion AS UNSIGNED) ASC; 
    `, params);
  }

  async getComunidades(idSeccion?: string) {
    const params: any[] = [];
    let whereClause = '';
    if (idSeccion && idSeccion !== 'all') {
      whereClause = `WHERE id_seccion = ?`;
      params.push(idSeccion);
    }
    return this.dataSource.query(`
      SELECT id_comunidad AS id, nombre_comunidad AS nombre 
      FROM comunidades
      ${whereClause}
      ORDER BY nombre_comunidad ASC;
    `, params);
  }
}