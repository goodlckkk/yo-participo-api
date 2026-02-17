import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResearchSitesService } from './research-sites.service';
import { CreateResearchSiteDto } from './dto/create-research-site.dto';
import { UpdateResearchSiteDto } from './dto/update-research-site.dto';

/**
 * Controlador para gestionar instituciones/sitios de investigación
 *
 * Endpoints:
 * - POST   /research-sites          - Crear institución
 * - GET    /research-sites          - Listar todas
 * - GET    /research-sites/search   - Buscar por nombre (autocomplete)
 * - GET    /research-sites/:id      - Obtener una por ID
 * - PATCH  /research-sites/:id      - Actualizar
 * - DELETE /research-sites/:id      - Eliminar (desactivar)
 *
 * Todos los endpoints requieren autenticación JWT
 */
@Controller('research-sites')
@UseGuards(AuthGuard('jwt'))
export class ResearchSitesController {
  constructor(private readonly researchSitesService: ResearchSitesService) {}

  /**
   * Crear una nueva institución
   * POST /research-sites
   */
  @Post()
  create(@Body() createResearchSiteDto: CreateResearchSiteDto) {
    return this.researchSitesService.create(createResearchSiteDto);
  }

  /**
   * Listar todas las instituciones activas
   * GET /research-sites
   */
  @Get()
  findAll() {
    return this.researchSitesService.findAll();
  }

  /**
   * Buscar instituciones por nombre (autocomplete)
   * GET /research-sites/search?q=vanguardia
   */
  @Get('search')
  search(@Query('q') query: string) {
    return this.researchSitesService.search(query);
  }

  /**
   * Obtener una institución por ID
   * GET /research-sites/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.researchSitesService.findOne(id);
  }

  /**
   * Actualizar una institución
   * PATCH /research-sites/:id
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResearchSiteDto: UpdateResearchSiteDto,
  ) {
    return this.researchSitesService.update(id, updateResearchSiteDto);
  }

  /**
   * Eliminar (desactivar) una institución
   * DELETE /research-sites/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.researchSitesService.remove(id);
  }
}
