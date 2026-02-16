import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Cie10Code } from './entities/cie10-code.entity';

/**
 * Servicio para gestionar códigos CIE-10
 * 
 * Funcionalidades:
 * - Búsqueda por código o descripción
 * - Autocomplete para formularios
 * - Obtener código específico
 * - Listar por capítulo
 */
@Injectable()
export class Cie10Service {
  constructor(
    @InjectRepository(Cie10Code)
    private readonly cie10Repository: Repository<Cie10Code>,
  ) {}

  /**
   * Buscar códigos CIE-10 por texto
   * Busca en código, descripción y términos de búsqueda
   * Búsqueda insensible a acentos, tildes, diéresis y mayúsculas
   * 
   * @param query - Texto a buscar
   * @param limit - Cantidad máxima de resultados (default: 20)
   */
  async search(query: string, limit: number = 20): Promise<Cie10Code[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();

    // Búsqueda insensible a acentos usando la extensión unaccent
    const results = await this.cie10Repository
      .createQueryBuilder('cie10')
      .where('cie10.activo = :activo', { activo: true })
      .andWhere(
        '(unaccent(cie10.codigo) ILIKE unaccent(:search) OR unaccent(cie10.descripcion) ILIKE unaccent(:search))',
        { search: `%${searchTerm}%` },
      )
      .orderBy('cie10.codigo', 'ASC')
      .limit(limit)
      .getMany();

    return results;
  }

  /**
   * Obtener un código CIE-10 específico por su código
   * @param codigo - Código CIE-10 (ej: "E11.9")
   */
  async findByCodigo(codigo: string): Promise<Cie10Code> {
    const cie10 = await this.cie10Repository.findOne({
      where: { codigo, activo: true },
    });

    if (!cie10) {
      throw new NotFoundException(`Código CIE-10 "${codigo}" no encontrado`);
    }

    return cie10;
  }

  /**
   * Obtener un código CIE-10 por ID
   */
  async findOne(id: string): Promise<Cie10Code> {
    const cie10 = await this.cie10Repository.findOne({
      where: { id },
    });

    if (!cie10) {
      throw new NotFoundException(`Código CIE-10 con ID "${id}" no encontrado`);
    }

    return cie10;
  }

  /**
   * Listar todos los capítulos disponibles
   */
  async getCapitulos(): Promise<{ capitulo: string; rango: string }[]> {
    const capitulos = await this.cie10Repository
      .createQueryBuilder('cie10')
      .select('DISTINCT cie10.capitulo', 'capitulo')
      .addSelect('cie10.rango_capitulo', 'rango')
      .where('cie10.nivel = :nivel', { nivel: 0 })
      .andWhere('cie10.activo = :activo', { activo: true })
      .andWhere('cie10.capitulo IS NOT NULL')
      .orderBy('cie10.rango_capitulo', 'ASC')
      .getRawMany();

    return capitulos;
  }

  /**
   * Obtener códigos por capítulo
   * @param rangoCapitulo - Rango del capítulo (ej: "E00-E90")
   */
  async getByCapitulo(rangoCapitulo: string): Promise<Cie10Code[]> {
    return this.cie10Repository.find({
      where: {
        rango_capitulo: rangoCapitulo,
        activo: true,
      },
      order: { codigo: 'ASC' },
    });
  }

  /**
   * Obtener estadísticas de la base de datos CIE-10
   */
  async getStats(): Promise<{
    total: number;
    activos: number;
    capitulos: number;
    categorias: number;
    subcategorias: number;
  }> {
    const [total, activos, capitulos, categorias, subcategorias] =
      await Promise.all([
        this.cie10Repository.count(),
        this.cie10Repository.count({ where: { activo: true } }),
        this.cie10Repository.count({ where: { nivel: 0, activo: true } }),
        this.cie10Repository.count({ where: { nivel: 1, activo: true } }),
        this.cie10Repository.count({ where: { nivel: 2, activo: true } }),
      ]);

    return {
      total,
      activos,
      capitulos,
      categorias,
      subcategorias,
    };
  }

  /**
   * Validar que un array de códigos existan en la BD
   * @param codigos - Array de códigos CIE-10 a validar
   * @returns Array de códigos válidos encontrados
   */
  async validateCodigos(codigos: string[]): Promise<string[]> {
    if (!codigos || codigos.length === 0) {
      return [];
    }

    const found = await this.cie10Repository.find({
      where: codigos.map((codigo) => ({ codigo, activo: true })),
      select: ['codigo'],
    });

    return found.map((c) => c.codigo);
  }
}
