import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchSitesService } from './research-sites.service';
import { ResearchSitesController } from './research-sites.controller';
import { ResearchSite } from './entities/research-site.entity';

/**
 * Módulo para gestionar instituciones/sitios de investigación
 * 
 * Proporciona:
 * - CRUD completo de instituciones
 * - Búsqueda y autocomplete
 * - Validación de nombres únicos
 */
@Module({
  imports: [TypeOrmModule.forFeature([ResearchSite])],
  controllers: [ResearchSitesController],
  providers: [ResearchSitesService],
  exports: [ResearchSitesService], // Exportar para usar en otros módulos
})
export class ResearchSitesModule {}
