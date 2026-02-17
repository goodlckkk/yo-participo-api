import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Commune } from './entities/commune.entity';

/**
 * Servicio para gestionar las comunas de Chile
 *
 * Proporciona métodos para obtener la lista de comunas
 * y mantener el catálogo geográfico separado de sitios de investigación.
 */
@Injectable()
export class CommunesService {
  constructor(
    @InjectRepository(Commune)
    private readonly communeRepository: Repository<Commune>,
  ) {}

  /**
   * Obtener todas las comunas activas ordenadas por región y nombre
   */
  async findAll(): Promise<Commune[]> {
    return this.communeRepository.find({
      where: { activa: true },
      order: {
        region: 'ASC',
        nombre: 'ASC',
      },
    });
  }

  /**
   * Buscar comunas por nombre (para autocomplete)
   * @param query - Texto a buscar en el nombre de la comuna
   */
  async search(query: string): Promise<Commune[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.communeRepository.find({
      where: {
        nombre: ILike(`%${query}%`),
        activa: true,
      },
      order: { nombre: 'ASC' },
      take: 10, // Limitar a 10 resultados
    });
  }

  /**
   * Obtener comunas por región
   * @param region - Nombre de la región
   */
  async findByRegion(region: string): Promise<Commune[]> {
    return this.communeRepository.find({
      where: {
        region: ILike(`%${region}%`),
        activa: true,
      },
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Verificar si una comuna existe
   * @param nombre - Nombre de la comuna a verificar
   */
  async exists(nombre: string): Promise<boolean> {
    const count = await this.communeRepository.count({
      where: { nombre: ILike(nombre), activa: true },
    });
    return count > 0;
  }

  /**
   * Obtener una comuna por ID
   * @param id - UUID de la comuna
   */
  async findOne(id: string): Promise<Commune> {
    const commune = await this.communeRepository.findOne({
      where: { id },
    });

    if (!commune) {
      throw new NotFoundException(`Comuna con ID "${id}" no encontrada`);
    }

    return commune;
  }
}
