import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {

    const user = await this.usersService.findOneByEmail(loginDto.email);

    console.log('[Auth] Intento de login', {
      email: loginDto.email,
      usuarioEncontrado: Boolean(user),
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas (usuario no encontrado).');
    }

    const passwordsMatch = await bcrypt.compare(loginDto.password, user.password);

    console.log('[Auth] Resultado comparación contraseña', {
      email: loginDto.email,
      passwordsMatch,
    });

    if (!passwordsMatch) {
      throw new UnauthorizedException('Credenciales incorrectas (contraseña no coincide).');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresInSeconds = 15 * 60;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: expiresInSeconds,
      expires_at: expiresAt,
    };
  } 
}