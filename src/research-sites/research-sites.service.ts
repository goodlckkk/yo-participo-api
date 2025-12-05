import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ResearchSite } from './entities/research-site.entity';
import { Trial } from '../trials/entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';
import { CreateResearchSiteDto } from './dto/create-research-site.dto';
import { UpdateResearchSiteDto } from './dto/update-research-site.dto';

/**
 * Servicio para gestionar instituciones/sitios de investigación
 * 
 * Funcionalidades:
 * - CRUD completo
 * - Búsqueda por nombre (autocomplete)
 * - Validación de nombres únicos
 */
@Injectable()
export class ResearchSitesService {
  constructor(
    @InjectRepository(ResearchSite)
    private readonly researchSiteRepository: Repository<ResearchSite>,
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
  ) {}

  /**
   * Crear una nueva institución
   * Valida que el nombre no exista previamente
   */
  async create(
    createResearchSiteDto: CreateResearchSiteDto,
  ): Promise<ResearchSite> {
    // Verificar si ya existe una institución con ese nombre
    const existente = await this.researchSiteRepository.findOne({
      where: { nombre: createResearchSiteDto.nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una institución con el nombre "${createResearchSiteDto.nombre}"`,
      );
    }

    const researchSite = this.researchSiteRepository.create(
      createResearchSiteDto,
    );
    return this.researchSiteRepository.save(researchSite);
  }

  /**
   * Obtener todas las instituciones activas con contadores
   */
  async findAll(): Promise<any[]> {
    const sites = await this.researchSiteRepository.find({
      order: { nombre: 'ASC' },
    });

    // Agregar contadores de estudios y pacientes para cada sitio
    const sitesWithCounts = await Promise.all(
      sites.map(async (site) => {
        // Contar estudios clínicos del sitio
        const trialCount = await this.trialRepository.count({
          where: { researchSite: { id: site.id } },
        });

        // Contar pacientes derivados por este sitio
        const patientCount = await this.patientIntakeRepository.count({
          where: { referralResearchSiteId: site.id },
        });

        return {
          ...site,
          trialCount,
          patientCount,
        };
      })
    );

    return sitesWithCounts;
  }

  /**
   * Buscar instituciones por nombre (para autocomplete)
   * @param query - Texto a buscar en el nombre
   */
  async search(query: string): Promise<ResearchSite[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return this.researchSiteRepository.find({
      where: {
        nombre: ILike(`%${query}%`),
        activo: true,
      },
      order: { nombre: 'ASC' },
      take: 10, // Limitar a 10 resultados
    });
  }

  /**
   * Obtener una institución por ID
   */
  async findOne(id: string): Promise<ResearchSite> {
    const researchSite = await this.researchSiteRepository.findOne({
      where: { id },
      relations: ['trials'], // Incluir ensayos relacionados
    });

    if (!researchSite) {
      throw new NotFoundException(
        `Institución con ID "${id}" no encontrada`,
      );
    }

    return researchSite;
  }

  /**
   * Actualizar una institución
   */
  async update(
    id: string,
    updateResearchSiteDto: UpdateResearchSiteDto,
  ): Promise<ResearchSite> {
    const researchSite = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (
      updateResearchSiteDto.nombre &&
      updateResearchSiteDto.nombre !== researchSite.nombre
    ) {
      const existente = await this.researchSiteRepository.findOne({
        where: { nombre: updateResearchSiteDto.nombre },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe una institución con el nombre "${updateResearchSiteDto.nombre}"`,
        );
      }
    }

    Object.assign(researchSite, updateResearchSiteDto);
    return this.researchSiteRepository.save(researchSite);
  }

  /**
   * Eliminar una institución
   * Solo se permite si no tiene ensayos ni pacientes asociados
   */
  async remove(id: string): Promise<{ message: string }> {
    const researchSite = await this.findOne(id);

    // Contar ensayos asociados
    const trialCount = await this.trialRepository.count({
      where: { researchSite: { id: researchSite.id } },
    });

    // Contar pacientes derivados
    const patientCount = await this.patientIntakeRepository.count({
      where: { referralResearchSiteId: researchSite.id },
    });

    // Verificar si tiene ensayos o pacientes asociados
    if (trialCount > 0 || patientCount > 0) {
      const messages: string[] = [];
      if (trialCount > 0) messages.push(`${trialCount} estudio(s) clínico(s)`);
      if (patientCount > 0) messages.push(`${patientCount} paciente(s) derivado(s)`);
      
      throw new ConflictException(
        `No se puede eliminar la institución porque tiene ${messages.join(' y ')} asociado(s)`,
      );
    }

    // Si no tiene relaciones, eliminar físicamente
    await this.researchSiteRepository.remove(researchSite);

    return {
      message: `Institución "${researchSite.nombre}" eliminada exitosamente`,
    };
  }
}
