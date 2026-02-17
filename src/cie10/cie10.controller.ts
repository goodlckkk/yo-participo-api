import { Controller, Get, Query, Param } from '@nestjs/common';
import { Cie10Service } from './cie10.service';

/**
 * Controlador para códigos CIE-10
 *
 * Endpoints PÚBLICOS (no requieren autenticación):
 * - GET /cie10/search?q=diabetes&limit=20  - Buscar códigos
 * - GET /cie10/codigo/:codigo              - Obtener código específico
 * - GET /cie10/capitulos                   - Listar capítulos
 * - GET /cie10/capitulo/:rango             - Códigos por capítulo
 * - GET /cie10/stats                       - Estadísticas
 *
 * Nota: Los endpoints son públicos porque se usan en el formulario
 * web de pacientes que no requiere autenticación.
 */
@Controller('cie10')
export class Cie10Controller {
  constructor(private readonly cie10Service: Cie10Service) {}

  /**
   * Buscar códigos CIE-10
   * GET /cie10/search?q=diabetes&limit=20
   */
  @Get('search')
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.cie10Service.search(query, limitNum);
  }

  /**
   * Obtener código específico por código CIE-10
   * GET /cie10/codigo/E11.9
   */
  @Get('codigo/:codigo')
  async findByCodigo(@Param('codigo') codigo: string) {
    return this.cie10Service.findByCodigo(codigo);
  }

  /**
   * Listar todos los capítulos
   * GET /cie10/capitulos
   */
  @Get('capitulos')
  async getCapitulos() {
    return this.cie10Service.getCapitulos();
  }

  /**
   * Obtener códigos por capítulo
   * GET /cie10/capitulo/E00-E90
   */
  @Get('capitulo/:rango')
  async getByCapitulo(@Param('rango') rango: string) {
    return this.cie10Service.getByCapitulo(rango);
  }

  /**
   * Obtener estadísticas de la BD CIE-10
   * GET /cie10/stats
   */
  @Get('stats')
  async getStats() {
    return this.cie10Service.getStats();
  }

  /**
   * Obtener código por ID
   * GET /cie10/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cie10Service.findOne(id);
  }
}
