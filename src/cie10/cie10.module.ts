import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cie10Service } from './cie10.service';
import { Cie10Controller } from './cie10.controller';
import { Cie10Code } from './entities/cie10-code.entity';

/**
 * Módulo para gestionar códigos CIE-10
 * (Clasificación Internacional de Enfermedades, 10ª revisión)
 * 
 * Proporciona:
 * - Búsqueda de códigos por texto
 * - Autocomplete para formularios
 * - Listado por capítulos
 * - Validación de códigos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Cie10Code])],
  controllers: [Cie10Controller],
  providers: [Cie10Service],
  exports: [Cie10Service], // Exportar para usar en otros módulos
})
export class Cie10Module {}
