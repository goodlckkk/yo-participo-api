import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { Sponsor } from './entities/sponsor.entity';

/**
 * Módulo de Sponsors
 * 
 * Proporciona funcionalidad para gestionar patrocinadores de ensayos clínicos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
  exports: [SponsorsService],
})
export class SponsorsModule {}
