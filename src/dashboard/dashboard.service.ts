// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Construye de forma segura la cláusula WHERE y los parámetros para las consultas.
   * @param filters - DTO con los filtros opcionales.
   * @param alias - Alias de la tabla principal en la consulta (ej. 'r' o 'respuestas').
   * @returns Un objeto con la cláusula SQL y el array de parámetros.
   */
  private buildWhereClause(
    filters: DashboardQueryDto,
    alias: string = 'r',
  ): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.id_distrito_federal) {
      conditions.push(`${alias}.id_distritofederal = ?`);
      params.push(filters.id_distrito_federal);
    }
    if (filters.id_distrito_local) {
      conditions.push(`${alias}.id_distritolocal = ?`);
      params.push(filters.id_distrito_local);
    }
    if (filters.id_municipio) {
      conditions.push(`${alias}.id_municipio = ?`);
      params.push(filters.id_municipio);
    }

    const clause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  }

  /**
   * Une de forma segura las condiciones base de una consulta con los filtros opcionales.
   * @param baseConditions - Array con las condiciones fijas de la consulta.
   * @param whereInfo - Objeto devuelto por buildWhereClause.
   * @returns El string completo y seguro para el WHERE.
   */
  private buildQueryConditions(
    baseConditions: string[],
    whereInfo: { clause: string; params: any[] },
  ): string {
    const allConditions = [...baseConditions];
    if (whereInfo.clause) {
      // Extrae solo las condiciones, sin la palabra 'WHERE'
      const filterConditions = whereInfo.clause.substring(6);
      allConditions.push(filterConditions);
    }
    return `WHERE ${allConditions.join(' AND ')}`;
  }

  async getKpisGenerales(filters: DashboardQueryDto) {
    const whereInfo = this.buildWhereClause(filters);

    const totalEncuestasQuery = `
      SELECT COUNT(*) AS total
      FROM (SELECT DISTINCT id_usuario, fecha_respuesta FROM respuestas r ${whereInfo.clause}) AS conteo_unico;
    `;

    const coberturaQuery = `
      SELECT
        COUNT(DISTINCT id_municipio) AS municipiosCubiertos,
        COUNT(DISTINCT id_distritolocal) AS distritosLocalesCubiertos
      FROM respuestas r
      ${whereInfo.clause};
    `;
    
    // 👇 LÓGICA CORREGIDA Y ROBUSTA USANDO EL HELPER 👇
    const generoQuery = `
      SELECT o.texto_opcion AS genero, COUNT(r.id_respuesta) AS total
      FROM respuestas r
      JOIN opciones o ON r.id_opcion = o.id_opcion
      ${this.buildQueryConditions(['r.id_pregunta = 30'], whereInfo)}
      GROUP BY o.texto_opcion;
    `;

    const [totalEncuestas] = await this.dataSource.query(totalEncuestasQuery, whereInfo.params);
    const [cobertura] = await this.dataSource.query(coberturaQuery, whereInfo.params);
    const participacionGenero = await this.dataSource.query(generoQuery, whereInfo.params);

    return {
      totalEncuestas: parseInt(totalEncuestas.total, 10),
      cobertura: {
        municipios: parseInt(cobertura.municipiosCubiertos, 10),
        distritosLocales: parseInt(cobertura.distritosLocalesCubiertos, 10),
      },
      participacionGenero,
    };
  }

  async getGraficosDemograficos(filters: DashboardQueryDto) {
    const whereInfo = this.buildWhereClause(filters);

    const edadQuery = `
      SELECT o.texto_opcion AS rango, COUNT(r.id_respuesta) AS total
      FROM respuestas r JOIN opciones o ON r.id_opcion = o.id_opcion
      ${this.buildQueryConditions(['r.id_pregunta = 31'], whereInfo)}
      GROUP BY o.texto_opcion;
    `;

    const escolaridadQuery = `
      SELECT o.texto_opcion AS nivel, COUNT(r.id_respuesta) AS total
      FROM respuestas r JOIN opciones o ON r.id_opcion = o.id_opcion
      ${this.buildQueryConditions(['r.id_pregunta = 32'], whereInfo)}
      GROUP BY o.texto_opcion;
    `;

    const ocupacionQuery = `
      SELECT o.texto_opcion AS ocupacion, COUNT(r.id_respuesta) AS total
      FROM respuestas r JOIN opciones o ON r.id_opcion = o.id_opcion
      ${this.buildQueryConditions(['r.id_pregunta = 33'], whereInfo)}
      GROUP BY o.texto_opcion;
    `;

    const [distribucionEdad, nivelEscolaridad, ocupacionPrincipal] =
      await Promise.all([
        this.dataSource.query(edadQuery, whereInfo.params),
        this.dataSource.query(escolaridadQuery, whereInfo.params),
        this.dataSource.query(ocupacionQuery, whereInfo.params),
      ]);

    return { distribucionEdad, nivelEscolaridad, ocupacionPrincipal };
  }

  async getPreferencias(filters: DashboardQueryDto) {
    const whereInfo = this.buildWhereClause(filters);

    const preferenciasQuery = `
      SELECT o.texto_opcion AS candidato, COUNT(r.id_respuesta) AS total
      FROM respuestas r JOIN opciones o ON r.id_opcion = o.id_opcion
      ${this.buildQueryConditions(['r.id_pregunta IN (36, 37)'], whereInfo)}
      GROUP BY o.texto_opcion ORDER BY total DESC;
    `;

    const preferencias = await this.dataSource.query(
      preferenciasQuery,
      whereInfo.params,
    );
    return { preferencias };
  }

  async getUbicaciones(filters: DashboardQueryDto) {
    const { clause, params } = this.buildWhereClause(filters, 'respuestas');

    const ubicacionesQuery = `
      SELECT mu.latitud, mu.longitud
      FROM respuestas
      JOIN (
          SELECT id_usuario, MAX(ultima_actualizacion) as max_fecha
          FROM monitoreo_ubicacion GROUP BY id_usuario
      ) AS ultima_ubicacion ON respuestas.id_usuario = ultima_ubicacion.id_usuario
      JOIN monitoreo_ubicacion AS mu
      ON ultima_ubicacion.id_usuario = mu.id_usuario AND ultima_ubicacion.max_fecha = mu.ultima_actualizacion
      ${clause};
    `;

    const ubicaciones = await this.dataSource.query(ubicacionesQuery, params);
    return ubicaciones;
  }
}