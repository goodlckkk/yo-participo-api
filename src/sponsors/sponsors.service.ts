import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
  ) {}

  findAll(): Promise<Sponsor[]> {
    return this.sponsorRepository.find();
  }

  /**
   * Busca sponsors por nombre (case-insensitive)
   * Útil para autocompletado en el frontend
   * 
   * @param query - Texto a buscar en el nombre del sponsor
   * @returns Array de sponsors que coinciden con la búsqueda
   */
  async search(query: string): Promise<Sponsor[]> {
    if (!query || query.trim().length === 0) {
      // Si no hay query, retornar todos (limitado a 10)
      return this.sponsorRepository.find({
        take: 10,
        order: { name: 'ASC' },
      });
    }

    // Búsqueda case-insensitive con ILIKE (PostgreSQL)
    return this.sponsorRepository.find({
      where: {
        name: ILike(`%${query}%`),
      },
      take: 10, // Limitar resultados para performance
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });

    if (!sponsor) {
      throw new NotFoundException(`Sponsor con ID "${id}" no encontrado.`);
    }

    return sponsor;
  }

  async remove(id: string): Promise<void> {
    const sponsor = await this.findOne(id);
    await this.sponsorRepository.remove(sponsor);
  }

  create(createSponsorDto: CreateSponsorDto): Promise<Sponsor> {
    const sponsor = this.sponsorRepository.create(createSponsorDto);
    return this.sponsorRepository.save(sponsor);
  }

  async update(id: string, updateSponsorDto: UpdateSponsorDto): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.preload({
      id,
      ...updateSponsorDto,
    });

    if (!sponsor) {
      throw new NotFoundException(`Sponsor con ID "${id}" no encontrado.`);
    }

    return this.sponsorRepository.save(sponsor);
  }
}
