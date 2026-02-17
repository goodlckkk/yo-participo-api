import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';

/**
 * Servicio para gestionar los slides del hero
 * 
 * Proporciona métodos CRUD para administrar las imágenes del slider principal.
 * Incluye funcionalidades para:
 * - Listar slides (todos o solo activos)
 * - Crear nuevos slides
 * - Actualizar slides existentes
 * - Eliminar slides
 * - Reordenar slides
 */
@Injectable()
export class HeroSlidesService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepository: Repository<HeroSlide>,
  ) {}

  /**
   * Obtener todos los slides activos ordenados
   * Endpoint público para el home
   */
  async findAllActive(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Obtener todos los slides (admin)
   * Incluye activos e inactivos
   */
  async findAll(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un slide por ID
   */
  async findOne(id: string): Promise<HeroSlide> {
    const slide = await this.heroSlideRepository.findOne({ where: { id } });
    
    if (!slide) {
      throw new NotFoundException(`Slide con ID ${id} no encontrado`);
    }
    
    return slide;
  }

  /**
   * Crear un nuevo slide
   */
  async create(createHeroSlideDto: CreateHeroSlideDto): Promise<HeroSlide> {
    const slide = this.heroSlideRepository.create(createHeroSlideDto);
    return this.heroSlideRepository.save(slide);
  }

  /**
   * Actualizar un slide existente
   */
  async update(id: string, updateHeroSlideDto: UpdateHeroSlideDto): Promise<HeroSlide> {
    const slide = await this.findOne(id);
    
    Object.assign(slide, updateHeroSlideDto);
    
    return this.heroSlideRepository.save(slide);
  }

  /**
   * Eliminar un slide
   */
  async remove(id: string): Promise<void> {
    const slide = await this.findOne(id);
    await this.heroSlideRepository.remove(slide);
  }

  /**
   * Reordenar slides
   * Recibe un array de IDs en el orden deseado
   */
  async reorder(slideIds: string[]): Promise<HeroSlide[]> {
    const slides = await this.heroSlideRepository.findByIds(slideIds);
    
    // Actualizar el orden de cada slide
    const updatedSlides = slides.map((slide, index) => {
      slide.order = slideIds.indexOf(slide.id);
      return slide;
    });
    
    return this.heroSlideRepository.save(updatedSlides);
  }
}
