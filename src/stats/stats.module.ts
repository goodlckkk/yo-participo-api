/**
 * Módulo de Estadísticas
 * 
 * Proporciona endpoints para obtener estadísticas del sistema.
 * Requiere autenticación JWT.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Trial } from '../trials/entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trial, PatientIntake])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
