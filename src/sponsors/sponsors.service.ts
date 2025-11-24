import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';

/**
 * Servicio de Sponsors
 * 
 * Maneja la lógica de negocio relacionada con los patrocinadores
 */
@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
  ) {}

  /**
   * Obtener todos los sponsors
   */
  async findAll(): Promise<Sponsor[]> {
    return this.sponsorRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
}
