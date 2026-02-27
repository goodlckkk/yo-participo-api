import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class SponsorsService {
  private readonly logger = new Logger(SponsorsService.name);

  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    private readonly auditLogsService: AuditLogsService,
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

  async create(createSponsorDto: CreateSponsorDto, user?: any): Promise<Sponsor> {
    // Verificar si ya existe un sponsor con ese nombre
    const existente = await this.sponsorRepository.findOne({
      where: { name: createSponsorDto.name },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un sponsor con el nombre "${createSponsorDto.name}"`,
      );
    }

    const sponsor = this.sponsorRepository.create(createSponsorDto);
    const saved = await this.sponsorRepository.save(sponsor);

    // Registrar en audit log
    try {
      await this.auditLogsService.logChange(
        'Sponsor',
        saved.id,
        'CREATE',
        { name: saved.name, sponsor_type: saved.sponsor_type },
        user?.sub || user?.id,
        user?.email,
      );
      this.logger.log(`📋 Audit log registrado para sponsor ${saved.id} (CREATE)`);
    } catch (auditError) {
      this.logger.warn(`⚠️ No se pudo registrar audit log: ${auditError.message}`);
    }

    return saved;
  }

  async update(id: string, updateSponsorDto: UpdateSponsorDto, user?: any): Promise<Sponsor> {
    // Obtener valores anteriores para comparar
    const existing = await this.sponsorRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Sponsor con ID "${id}" no encontrado.`);
    }

    const sponsor = await this.sponsorRepository.preload({
      id,
      ...updateSponsorDto,
    });

    const saved = await this.sponsorRepository.save(sponsor);

    // Registrar en audit log
    try {
      const changes: Record<string, { before: any; after: any }> = {};
      const fieldsToTrack = ['name', 'description', 'web_site', 'sponsor_type'];
      for (const field of fieldsToTrack) {
        if (updateSponsorDto[field] !== undefined && existing[field] !== updateSponsorDto[field]) {
          changes[field] = { before: existing[field], after: updateSponsorDto[field] };
        }
      }

      if (Object.keys(changes).length > 0) {
        await this.auditLogsService.logChange(
          'Sponsor',
          id,
          'UPDATE',
          changes,
          user?.sub || user?.id,
          user?.email,
        );
        this.logger.log(`📋 Audit log registrado para sponsor ${id} (UPDATE) por ${user?.email || 'sistema'}`);
      }
    } catch (auditError) {
      this.logger.warn(`⚠️ No se pudo registrar audit log: ${auditError.message}`);
    }

    return saved;
  }
}
