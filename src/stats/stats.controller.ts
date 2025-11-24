/**
 * Controlador de Estadísticas
 * 
 * Endpoint: GET /stats
 * 
 * Proporciona estadísticas generales del sistema para el dashboard:
 * - Total de ensayos por estado
 * - Total de pacientes postulados
 * - Tendencias de postulaciones
 * - Ensayos más populares
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats() {
    return this.statsService.getGeneralStats();
  }

  @Get('trends')
  async getTrends() {
    return this.statsService.getPatientIntakeTrends();
  }
}
