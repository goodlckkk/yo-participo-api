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

import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getStats() {
    return this.statsService.getGeneralStats();
  }

  @Get('trends')
  @UseGuards(AuthGuard('jwt'))
  async getTrends() {
    return this.statsService.getPatientIntakeTrends();
  }

  @Get('public')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=300')
  async getPublicStats() {
    return this.statsService.getPublicStats();
  }
}
