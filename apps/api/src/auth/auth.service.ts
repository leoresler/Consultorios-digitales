import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../users/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usuariosService.create(registerDto);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles_usuario: user.roles_usuario,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        roles_usuario: user.roles_usuario,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usuariosService.findByEmail(email);

    if (!user || user?.email != email) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    /*if (user.roles_usuario === 'DOCTOR' && !user.isApproved) {
      throw new ForbiddenException('Tu cuenta de médico aún no ha sido aprobada por un administrador.');
    }*/

    const passwordMatched: boolean = await bcrypt.compare(password, user.contrasena,);
    
    if (!passwordMatched) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles_usuario: user.roles_usuario,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        roles_usuario: user.roles_usuario,
      },
    };
  }

  async requesPatientOtp(telefono: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const user = await this.usuariosService.findOrCreateByPhone(telefono, 'PACIENTE');

    await this.usuariosService.saveOtp(user.id, otpCode, otpExpiresAt);

    return { message: 'Codigo OTP enviado con exito al telefono'};
  }

  async verifyPatientOtp(telefono: string, otp: string) {
    const user = await this.usuariosService.findByPhone(telefono);

    if (!user || user.otpCode !== otp || new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('Codigo OTP inválido o expirado.');
    }

    await this.usuariosService.clearOtp(user.id);

    const payload: JwtPayload = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        telefono: user.phone,
        roles_usuario: user.roles_usuario,
      },
    };
  }

  async saveOtp(id: NumberConstructor, otpCode: string, otpExpiresAt: Date): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id },
      data: {
        otpCode,
        otpExpiresAt,
      },
    });
  }
}