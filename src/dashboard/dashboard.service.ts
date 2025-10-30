// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { QuestionResultDto } from './dto/question-result.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Construye la cláusula WHERE SÓLO para filtros geográficos.
   */
  private buildGeoFilterClause(
    filters: DashboardQueryDto,
    alias: string = 'r',
  ): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.id_estado && filters.id_estado !== 'all') {
      conditions.push(`${alias}.id_estado = ?`);
      params.push(filters.id_estado);
    }
    if (filters.id_distrito_federal && filters.id_distrito_federal !== 'all') {
      conditions.push(`${alias}.id_distritofederal = ?`);
      params.push(filters.id_distrito_federal);
    }
    if (filters.id_distrito_local && filters.id_distrito_local !== 'all') {
      conditions.push(`${alias}.id_distritolocal = ?`);
      params.push(filters.id_distrito_local);
    }
    if (filters.id_municipio && filters.id_municipio !== 'all') {
      conditions.push(`${alias}.id_municipio = ?`);
      params.push(filters.id_municipio);
    }
    if (filters.id_seccion && filters.id_seccion !== 'all') {
      conditions.push(`${alias}.id_seccion = ?`);
      params.push(filters.id_seccion);
    }
    if (filters.id_comunidad && filters.id_comunidad !== 'all') {
      conditions.push(`${alias}.id_comunidad = ?`);
      params.push(filters.id_comunidad);
    }

    const clause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  }

  /**
   * Construye la subconsulta principal que identifica a los encuestados
   * que cumplen TODOS los filtros (geográficos y de respuestas).
   */
  private buildFilteredEncuestadosSubquery(
    filters: DashboardQueryDto,
    mainAlias: string = 'r',
  ): { subQueryClause: string; params: any[] } {
    const { clause: geoClause, params: geoParams } = this.buildGeoFilterClause(
      filters,
      'rr',
    );
    const answerFilters = filters.answerFilters || {};
    const answerFilterEntries = Object.entries(answerFilters);

    if (geoParams.length === 0 && answerFilterEntries.length === 0) {
      return { subQueryClause: '', params: [] };
    }

    let subQuery = `
      WHERE (${mainAlias}.id_usuario, ${mainAlias}.fecha_respuesta) IN (
          SELECT DISTINCT rr.id_usuario, rr.fecha_respuesta
          FROM respuestas rr
    `;

    const subQueryConditions: string[] = [];
    const subQueryParams: any[] = [];

    if (geoParams.length > 0) {
      subQueryConditions.push(geoClause.substring(6)); // Quita 'WHERE '
      subQueryParams.push(...geoParams);
    }

    answerFilterEntries.forEach(([questionId, optionIds], index) => {
      if (optionIds && optionIds.length > 0) {
        const placeholders = optionIds.map(() => '?').join(',');
        subQueryConditions.push(`
            EXISTS (
                SELECT 1
                FROM respuestas r_filter_${index}
                WHERE r_filter_${index}.id_usuario = rr.id_usuario
                  AND r_filter_${index}.fecha_respuesta = rr.fecha_respuesta
                  AND r_filter_${index}.id_pregunta = ?
                  AND r_filter_${index}.id_opcion IN (${placeholders})
            )
        `);
        subQueryParams.push(parseInt(questionId, 10), ...optionIds);
      }
    });

    if (subQueryConditions.length > 0) {
      subQuery += ` WHERE ${subQueryConditions.join(' AND ')} )`;
    } else {
      subQuery += ` )`; // Cierra el IN () si solo había geo (aunque ya se cubrió arriba)
    }

    return { subQueryClause: subQuery, params: subQueryParams };
  }

  /**
   * Une de forma segura las condiciones base de una consulta con los filtros opcionales.
   */
  private buildQueryConditions(
    baseConditions: string[],
    whereInfo: { clause: string; params: any[] },
  ): string {
    const allConditions = [...baseConditions];
    if (whereInfo.clause) {
      const filterConditions = whereInfo.clause.replace('WHERE ', 'AND ');
      allConditions.push(filterConditions);
    }
    // Si la cláusula de filtros está vacía, solo usa las condiciones base
    // Si no, une la base + "AND" + filtros
    return `WHERE ${allConditions.join(' ')}`;
  }

  // --- MÉTODOS DE ENDPOINT ACTUALIZADOS ---

  async getKpisGenerales(filters: DashboardQueryDto) {
    const { subQueryClause, params: subQueryParams } =
      this.buildFilteredEncuestadosSubquery(filters, 'r');

    const totalEncuestasQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT DISTINCT r.id_usuario, r.fecha_respuesta 
        FROM respuestas r
        ${subQueryClause}
      ) AS conteo_unico;
    `;

    const coberturaQuery = `
      SELECT
        COUNT(DISTINCT r.id_municipio) AS municipiosCubiertos,
        COUNT(DISTINCT r.id_distritolocal) AS distritosLocalesCubiertos
      FROM respuestas r
      ${subQueryClause};
    `;

    // Consulta de género (pregunta 30) - LÓGICA CORREGIDA
    const generoQuery = `
      SELECT o.texto_opcion AS genero, COUNT(r.id_respuesta) AS total
      FROM respuestas r
      JOIN opciones o ON r.id_opcion = o.id_opcion
      WHERE r.id_pregunta = 30
      ${subQueryClause.replace('WHERE', 'AND')} GROUP BY o.texto_opcion;
    `;

    // Si subQueryClause está vacío, el replace no hace nada y la consulta es correcta.
    // Si subQueryClause tiene "WHERE ...", se reemplaza con "AND ..." y la consulta es correcta.

    const [totalEncuestas] = await this.dataSource.query(
      totalEncuestasQuery,
      subQueryParams,
    );
    const [cobertura] = await this.dataSource.query(
      coberturaQuery,
      subQueryParams,
    );
    const participacionGenero = await this.dataSource.query(
      generoQuery,
      subQueryParams,
    );

    return {
      totalEncuestas: parseInt(totalEncuestas.total, 10) || 0,
      cobertura: {
        municipios: parseInt(cobertura.municipiosCubiertos, 10) || 0,
        distritosLocales:
          parseInt(cobertura.distritosLocalesCubiertos, 10) || 0,
      },
      participacionGenero: participacionGenero.map((item) => ({
        ...item,
        total: parseInt(item.total, 10) || 0,
      })),
    };
  }

  async getUbicaciones(filters: DashboardQueryDto) {
    const { subQueryClause, params } = this.buildFilteredEncuestadosSubquery(
      filters,
      'respuestas',
    );

    const ubicacionesQuery = `
      SELECT DISTINCT mu.latitud, mu.longitud
      FROM respuestas
      JOIN (
          SELECT id_usuario, MAX(ultima_actualizacion) as max_fecha
          FROM monitoreo_ubicacion GROUP BY id_usuario
      ) AS ultima_ubicacion ON respuestas.id_usuario = ultima_ubicacion.id_usuario
      JOIN monitoreo_ubicacion AS mu
      ON ultima_ubicacion.id_usuario = mu.id_usuario AND ultima_ubicacion.max_fecha = mu.ultima_actualizacion
      ${subQueryClause};
    `;

    return this.dataSource.query(ubicacionesQuery, params);
  }

  async getQuestionResults(
    idPregunta: number,
    filters: DashboardQueryDto,
  ): Promise<QuestionResultDto[]> {
    const { subQueryClause, params: subQueryParams } =
      this.buildFilteredEncuestadosSubquery(filters, 'r');

    let mainQuery = `
      SELECT
        o.texto_opcion AS label,
        COUNT(r.id_respuesta) AS value
      FROM respuestas r
      JOIN opciones o ON r.id_opcion = o.id_opcion
    `;

    const whereConditions: string[] = [`r.id_pregunta = ?`];
    const queryParams: any[] = [idPregunta];

    if (subQueryClause) {
      mainQuery += ` ${subQueryClause} AND ${whereConditions[0]}`;
      queryParams.push(...subQueryParams);
    } else {
      mainQuery += ` WHERE ${whereConditions[0]}`;
    }

    mainQuery += `
      GROUP BY o.texto_opcion
      ORDER BY value DESC;
    `;

    try {
      const results = await this.dataSource.query(mainQuery, queryParams);
      return results.map((item) => ({
        ...item,
        value: parseInt(item.value, 10) || 0,
      }));
    } catch (error) {
      console.error('Error executing dynamic filter query:', error);
      throw error;
    }
  }

  // --- MÉTODOS OBSOLETOS ELIMINADOS ---
  // getGraficosDemograficos y getPreferencias se han eliminado
}
