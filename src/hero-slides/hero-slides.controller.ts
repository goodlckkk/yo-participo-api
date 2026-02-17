import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HeroSlidesService } from './hero-slides.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';

/**
 * Controlador para gestionar los slides del hero
 *
 * Endpoints:
 * - GET /hero-slides/active (público) - Obtener slides activos para el home
 * - GET /hero-slides (protegido) - Obtener todos los slides (admin)
 * - POST /hero-slides (protegido) - Crear nuevo slide
 * - PATCH /hero-slides/:id (protegido) - Actualizar slide
 * - DELETE /hero-slides/:id (protegido) - Eliminar slide
 * - PUT /hero-slides/reorder (protegido) - Reordenar slides
 */
@Controller('hero-slides')
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  /**
   * Obtener slides activos (público)
   * Usado por el home para mostrar el slider
   */
  @Get('active')
  findAllActive() {
    return this.heroSlidesService.findAllActive();
  }

  /**
   * Obtener todos los slides (admin)
   * Requiere autenticación
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.heroSlidesService.findAll();
  }

  /**
   * Obtener un slide por ID (admin)
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.heroSlidesService.findOne(id);
  }

  /**
   * Crear un nuevo slide (admin)
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createHeroSlideDto: CreateHeroSlideDto) {
    return this.heroSlidesService.create(createHeroSlideDto);
  }

  /**
   * Actualizar un slide (admin)
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateHeroSlideDto: UpdateHeroSlideDto,
  ) {
    return this.heroSlidesService.update(id, updateHeroSlideDto);
  }

  /**
   * Eliminar un slide (admin)
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.heroSlidesService.remove(id);
  }

  /**
   * Reordenar slides (admin)
   * Body: { slideIds: string[] }
   */
  @Put('reorder')
  @UseGuards(AuthGuard('jwt'))
  reorder(@Body('slideIds') slideIds: string[]) {
    return this.heroSlidesService.reorder(slideIds);
  }
}
