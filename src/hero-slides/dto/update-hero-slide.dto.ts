import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroSlideDto } from './create-hero-slide.dto';

/**
 * DTO para actualizar un slide del hero
 * 
 * Todos los campos son opcionales (hereda de CreateHeroSlideDto con PartialType)
 */
export class UpdateHeroSlideDto extends PartialType(CreateHeroSlideDto) {}
