import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import type { Request } from 'express';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Proteger todo el controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN') // Solo administradores pueden crear usuarios
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('bootstrap/first-admin')
  // Endpoint temporal SIN protección para crear el primer admin
  // ⚠️ ELIMINAR ESTE ENDPOINT EN PRODUCCIÓN
  async createFirstAdmin(@Body() createUserDto: CreateUserDto) {
    // Solo permitir si no hay usuarios ADMIN
    const existingAdmins = await this.usersService.findAdmins();
    if (existingAdmins.length > 0) {
      throw new Error('Ya existe al menos un administrador. Use el endpoint protegido.');
    }
    // Forzar rol ADMIN
    createUserDto.role = UserRole.ADMIN;
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN') // Solo administradores pueden ver todos los usuarios
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile/me')
  // Cualquier usuario autenticado puede ver su propio perfil
  async getProfile(@Req() request: Request) {
    const user = request.user as { id: string };
    return this.usersService.findOne(user.id);
  }

  @Get('by-institution/:institutionId')
  @Roles('ADMIN') // Solo administradores pueden consultar usuarios por institución
  findByInstitution(@Param('institutionId') institutionId: string) {
    return this.usersService.findByInstitutionId(institutionId);
  }

  @Get(':id')
  @Roles('ADMIN') // Solo administradores pueden ver otros usuarios
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN') // Solo administradores pueden actualizar usuarios
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN') // Solo administradores pueden eliminar usuarios
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
