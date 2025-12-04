import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlidesController } from './hero-slides.controller';
import { HeroSlide } from './entities/hero-slide.entity';

/**
 * Módulo para gestionar los slides del hero
 * 
 * Proporciona endpoints para administrar las imágenes del slider principal
 * de la página de inicio.
 */
@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide])],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
