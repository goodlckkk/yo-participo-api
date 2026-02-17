import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commune } from './entities/commune.entity';
import { CommunesService } from './communes.service';
import { CommunesController } from './communes.controller';

/**
 * Módulo para gestionar las comunas de Chile
 *
 * Este módulo proporciona endpoints para obtener la lista de comunas
 * y mantener un catálogo limpio separado de los sitios de investigación.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Commune])],
  controllers: [CommunesController],
  providers: [CommunesService],
  exports: [CommunesService], // Exportar para uso en otros módulos
})
export class CommunesModule {}
