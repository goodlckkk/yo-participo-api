import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SponsorsService } from './sponsors.service';

/**
 * Controlador de Sponsors
 * Ruta base: /sponsors
 * 
 * Endpoints:
 * - GET / : Obtener todos los sponsors
 */
@Controller('sponsors')
@UseGuards(AuthGuard('jwt'))
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get()
  findAll() {
    return this.sponsorsService.findAll();
  }
}
