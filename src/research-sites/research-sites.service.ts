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
import { CommunesService } from '../communes/communes.service';

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
    private readonly communesService: CommunesService,
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
   * Verificar si un nombre corresponde a una comuna
   * @private
   */
  private async isCommuneName(name: string): Promise<boolean> {
    return this.communesService.exists(name);
  }

  /**
   * Obtener todas las instituciones activas con contadores
   * EXCLUYE las comunas que fueron incorrectamente insertadas como sitios de investigación
   */
  async findAll(): Promise<any[]> {
    const sites = await this.researchSiteRepository.find({
      order: { nombre: 'ASC' },
    });

    // Filtrar sitios que NO son comunas
    const filteredSites = [];
    for (const site of sites) {
      const isCommune = await this.isCommuneName(site.nombre);
      if (!isCommune) {
        filteredSites.push(site);
      }
    }

    // Agregar contadores de estudios y pacientes para cada sitio
    const sitesWithCounts = await Promise.all(
      filteredSites.map(async (site) => {
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
      }),
    );

    return sitesWithCounts;
  }

  /**
   * Buscar instituciones por nombre (para autocomplete)
   * EXCLUYE las comunas que fueron incorrectamente insertadas como sitios de investigación
   * @param query - Texto a buscar en el nombre
   */
  async search(query: string): Promise<ResearchSite[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const sites = await this.researchSiteRepository.find({
      where: {
        nombre: ILike(`%${query}%`),
        activo: true,
      },
      order: { nombre: 'ASC' },
      take: 20, // Tomar más resultados para filtrar
    });

    // Filtrar sitios que NO son comunas
    const filteredSites = [];
    for (const site of sites) {
      const isCommune = await this.isCommuneName(site.nombre);
      if (!isCommune) {
        filteredSites.push(site);
      }
    }

    // Devolver máximo 10 resultados después del filtrado
    return filteredSites.slice(0, 10);
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
      throw new NotFoundException(`Institución con ID "${id}" no encontrada`);
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
   * Desvincula automáticamente ensayos y pacientes asociados antes de eliminar
   */
  async remove(id: string): Promise<{ message: string }> {
    const researchSite = await this.researchSiteRepository.findOne({
      where: { id },
    });

    if (!researchSite) {
      throw new NotFoundException(`Institución con ID "${id}" no encontrada`);
    }

    try {
      console.log(
        `🗑️ Iniciando eliminación de institución: ${researchSite.nombre}`,
      );

      // 1. Desvincular todos los ensayos clínicos de esta institución (SET NULL)
      const trialsUpdated = await this.trialRepository
        .createQueryBuilder()
        .update(Trial)
        .set({ researchSite: null })
        .where('research_site_id = :siteId', { siteId: id })
        .execute();

      console.log(`📝 Ensayos desvinculados: ${trialsUpdated.affected || 0}`);

      // 2. Desvincular todos los pacientes derivados por esta institución (SET NULL)
      const patientsUpdated = await this.patientIntakeRepository
        .createQueryBuilder()
        .update(PatientIntake)
        .set({ referralResearchSiteId: null })
        .where('referralResearchSiteId = :siteId', { siteId: id })
        .execute();

      console.log(
        `📝 Pacientes desvinculados: ${patientsUpdated.affected || 0}`,
      );

      // 3. Ahora podemos eliminar la institución de forma segura
      await this.researchSiteRepository.delete(id);

      console.log(
        `✅ Institución "${researchSite.nombre}" eliminada exitosamente`,
      );

      return {
        message: `Institución "${researchSite.nombre}" eliminada exitosamente`,
      };
    } catch (error) {
      console.error('❌ Error al eliminar institución:', error);
      throw new Error(`Error al eliminar la institución: ${error.message}`);
    }
  }
}
