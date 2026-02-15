import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findOneByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = { findOneByEmail: jest.fn() };
    jwtService = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería generar un token cuando las credenciales son válidas', async () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'plain-password',
    };

    const mockUser = {
      id: 'user-id',
      email: loginDto.email,
      password: 'hashed-password',
      role: 'ADMIN',
    };

    usersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('jwt-token');

    await expect(service.login(loginDto)).resolves.toEqual({ access_token: 'jwt-token' });

    expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  it('debería lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'wrong-password',
    };

    const mockUser = {
      id: 'user-id',
      email: loginDto.email,
      password: 'hashed-password',
      role: 'ADMIN',
    };

    usersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);

    expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
  });
});
