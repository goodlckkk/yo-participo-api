import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchSitesService } from './research-sites.service';
import { ResearchSitesController } from './research-sites.controller';
import { ResearchSite } from './entities/research-site.entity';
import { Trial } from '../trials/entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';
import { CommunesModule } from '../communes/communes.module';

/**
 * Módulo para gestionar instituciones/sitios de investigación
 * 
 * Proporciona:
 * - CRUD completo de instituciones
 * - Búsqueda y autocomplete
 * - Validación de nombres únicos
 * - Contadores de estudios y pacientes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ResearchSite, Trial, PatientIntake]),
    CommunesModule, // Para usar CommunesService
  ],
  controllers: [ResearchSitesController],
  providers: [ResearchSitesService],
  exports: [ResearchSitesService], // Exportar para usar en otros módulos
})
export class ResearchSitesModule {}
