import { Controller, Get, Query } from '@nestjs/common';
import { CommunesService } from './communes.service';
import { Commune } from './entities/commune.entity';

/**
 * Controlador para gestionar las comunas de Chile
 *
 * Endpoints para obtener la lista de comunas y realizar búsquedas
 * separadas del catálogo de sitios de investigación.
 */
@Controller('communes')
export class CommunesController {
  constructor(private readonly communesService: CommunesService) {}

  /**
   * Obtener todas las comunas activas
   * @returns Lista de comunas ordenadas por región y nombre
   */
  @Get()
  async findAll(): Promise<Commune[]> {
    return this.communesService.findAll();
  }

  /**
   * Buscar comunas por nombre
   * @param query - Texto a buscar en el nombre de la comuna
   * @returns Lista de comunas que coinciden con la búsqueda
   */
  @Get('search')
  async search(@Query('q') query: string): Promise<Commune[]> {
    return this.communesService.search(query);
  }

  /**
   * Obtener comunas por región
   * @param region - Nombre de la región
   * @returns Lista de comunas de la región especificada
   */
  @Get('region')
  async findByRegion(@Query('region') region: string): Promise<Commune[]> {
    return this.communesService.findByRegion(region);
  }
}
