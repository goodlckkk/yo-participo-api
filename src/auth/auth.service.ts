import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {

    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas (usuario no encontrado).');
    }

    const passwordsMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!passwordsMatch) {
      throw new UnauthorizedException('Credenciales incorrectas (contraseña no coincide).');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    
    // Calcular la fecha de expiración
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const expiresInMs = this.parseExpirationTime(expiresIn);
    const expires_at = new Date(Date.now() + expiresInMs).toISOString();

    return {
      access_token,
      expires_at,
    };
  }
  
  /**
   * Convierte el formato de tiempo (ej: '15m', '1h', '7d') a milisegundos
   */
  private parseExpirationTime(time: string): number {
    const units: { [key: string]: number } = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Por defecto 15 minutos
      return 15 * 60 * 1000;
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    return value * (units[unit] || units.m);
  }
}