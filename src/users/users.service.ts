import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password, ...rest } = createUserDto;

      const normalizedEmail = email.trim().toLowerCase();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        ...rest,
        email: normalizedEmail,
        password: hashedPassword,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Ya existe un usuario con este correo electrónico.');
      }
      throw error;
    }
  }
  async findAll() {
    return this.userRepository.find({
      select: ['id', 'fullName', 'email', 'role', 'phone', 'birth_date'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'role', 'phone', 'birth_date'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.institution', 'institution')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { birth_date, password, email, ...rest } = updateUserDto;

    const data: Partial<User> = { ...rest };

    if (email) {
      data.email = email.trim().toLowerCase();
    }

    if (birth_date) {
      data.birth_date = new Date(birth_date);
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await this.userRepository.preload({
      id,
      ...data,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Ya existe un usuario con este correo electrónico.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByInstitutionId(institutionId: string) {
    return this.userRepository.findOne({
      where: { institutionId, role: UserRole.INSTITUTION },
      select: ['id', 'fullName', 'email', 'role', 'institutionId'],
    });
  }

  async findAdmins() {
    return this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id', 'email', 'role'],
    });
  }
}
