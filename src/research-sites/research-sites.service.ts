import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ResearchSite } from './entities/research-site.entity';
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
   * Obtener todas las instituciones activas
   */
  async findAll(): Promise<ResearchSite[]> {
    return this.researchSiteRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
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
        nombre: Like(`%${query}%`),
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
   * Eliminar (desactivar) una institución
   * No se elimina físicamente para mantener integridad referencial
   */
  async remove(id: string): Promise<{ message: string }> {
    const researchSite = await this.findOne(id);

    // Verificar si tiene ensayos asociados
    if (researchSite.trials && researchSite.trials.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la institución porque tiene ${researchSite.trials.length} ensayo(s) asociado(s)`,
      );
    }

    // Desactivar en lugar de eliminar
    researchSite.activo = false;
    await this.researchSiteRepository.save(researchSite);

    return {
      message: `Institución "${researchSite.nombre}" desactivada exitosamente`,
    };
  }
}
