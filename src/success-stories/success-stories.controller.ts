import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuccessStoriesService } from './success-stories.service';
import { CreateSuccessStoryDto } from './dto/create-success-story.dto';
import { UpdateSuccessStoryDto } from './dto/update-success-story.dto';

/**
 * Controlador para gestionar historias de éxito
 * 
 * Endpoints:
 * - GET /success-stories/active (público) - Historias activas para el home
 * - GET /success-stories (admin) - Todas las historias
 * - POST /success-stories (admin) - Crear historia
 * - PATCH /success-stories/:id (admin) - Actualizar historia
 * - DELETE /success-stories/:id (admin) - Eliminar historia
 * - PUT /success-stories/reorder (admin) - Reordenar historias
 */
@Controller('success-stories')
export class SuccessStoriesController {
  constructor(
    private readonly successStoriesService: SuccessStoriesService,
  ) {}

  /**
   * Obtener historias activas (endpoint público)
   * Para mostrar en la página de inicio
   */
  @Get('active')
  findAllActive() {
    return this.successStoriesService.findAllActive();
  }

  /**
   * Obtener todas las historias (admin)
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.successStoriesService.findAll();
  }

  /**
   * Obtener una historia por ID (admin)
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.successStoriesService.findOne(id);
  }

  /**
   * Crear una nueva historia (admin)
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createDto: CreateSuccessStoryDto) {
    return this.successStoriesService.create(createDto);
  }

  /**
   * Actualizar una historia (admin)
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateDto: UpdateSuccessStoryDto) {
    return this.successStoriesService.update(id, updateDto);
  }

  /**
   * Eliminar una historia (admin)
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.successStoriesService.remove(id);
  }

  /**
   * Reordenar historias (admin)
   * Body: { ids: ['uuid1', 'uuid2', ...] }
   */
  @Put('reorder')
  @UseGuards(AuthGuard('jwt'))
  reorder(@Body('ids') ids: string[]) {
    return this.successStoriesService.reorder(ids);
  }
}
