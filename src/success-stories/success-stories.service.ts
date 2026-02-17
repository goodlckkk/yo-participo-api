import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessStory } from './entities/success-story.entity';
import { CreateSuccessStoryDto } from './dto/create-success-story.dto';
import { UpdateSuccessStoryDto } from './dto/update-success-story.dto';

/**
 * Servicio para gestionar historias de éxito
 * 
 * Proporciona métodos CRUD y funcionalidades especiales:
 * - Obtener solo historias activas (para el home público)
 * - Obtener todas las historias (para el dashboard admin)
 * - Reordenar historias
 */
@Injectable()
export class SuccessStoriesService {
  constructor(
    @InjectRepository(SuccessStory)
    private readonly successStoryRepository: Repository<SuccessStory>,
  ) {}

  /**
   * Obtener solo historias activas, ordenadas por 'order'
   * Endpoint público para el home
   */
  async findAllActive(): Promise<SuccessStory[]> {
    return this.successStoryRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener todas las historias (activas e inactivas)
   * Solo para administradores
   */
  async findAll(): Promise<SuccessStory[]> {
    return this.successStoryRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una historia por ID
   */
  async findOne(id: string): Promise<SuccessStory> {
    const story = await this.successStoryRepository.findOne({
      where: { id },
    });

    if (!story) {
      throw new NotFoundException(`Historia con ID ${id} no encontrada`);
    }

    return story;
  }

  /**
   * Crear una nueva historia
   */
  async create(createDto: CreateSuccessStoryDto): Promise<SuccessStory> {
    const story = this.successStoryRepository.create({
      ...createDto,
      order: createDto.order ?? 0,
      isActive: createDto.isActive ?? true,
    });

    return this.successStoryRepository.save(story);
  }

  /**
   * Actualizar una historia existente
   */
  async update(
    id: string,
    updateDto: UpdateSuccessStoryDto,
  ): Promise<SuccessStory> {
    const story = await this.findOne(id);

    Object.assign(story, updateDto);

    return this.successStoryRepository.save(story);
  }

  /**
   * Eliminar una historia
   */
  async remove(id: string): Promise<void> {
    const story = await this.findOne(id);
    await this.successStoryRepository.remove(story);
  }

  /**
   * Reordenar historias
   * Recibe un array de IDs en el orden deseado
   */
  async reorder(ids: string[]): Promise<SuccessStory[]> {
    const stories = await this.successStoryRepository.findByIds(ids);

    if (stories.length !== ids.length) {
      throw new NotFoundException('Algunas historias no fueron encontradas');
    }

    // Actualizar el orden de cada historia
    const updatedStories = await Promise.all(
      ids.map(async (id, index) => {
        const story = stories.find((s) => s.id === id);
        if (story) {
          story.order = index;
          return this.successStoryRepository.save(story);
        }
        return null;
      }),
    );

    return updatedStories.filter((s) => s !== null) as SuccessStory[];
  }
}
