import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  rolesDeUsuario,
  UsuariosService,
} from '../users/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { CompletarPerfilDto } from './dto/completar-perfil.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { WhatsappCloudProvider } from './services/whatsapp-cloud.provider.js';
import { Prisma } from '@prisma/client';
import { UsuarioResponse } from '../users/interfaces/user-response.interface.js';

const OTP_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private whatsappSender: WhatsappCloudProvider,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.usuariosService.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usuariosService.create(dto, 'PACIENTE');
    const roles = user.roles_usuario;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles_usuario: roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        roles_usuario: roles,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usuariosService.findByEmailWithPassword(email);

    if (
      !user ||
      !user.email ||
      user.email !== email ||
      !user.contrasena
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roles = rolesDeUsuario(user.roles_usuario);

    if (roles.includes('MEDICO') && !user.isApproved) {
      throw new ForbiddenException(
        'Tu cuenta de médico aún no ha sido aprobada por un administrador.',
      );
    }

    const passwordMatched: boolean = await bcrypt.compare(
      password,
      user.contrasena,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      telefono: user.telefono ?? undefined,
      roles_usuario: roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        telefono: user.telefono,
        nombre: user.nombre,
        roles_usuario: roles,
      },
    };
  }

  async requestOtp(telefono: string) {
    const normalizado = this.normalizarTelefono(telefono);
    const user = await this.usuariosService.findOrCreateByPhone(
      normalizado,
      'PACIENTE',
    );

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.usuariosService.saveOtp(user.id, otpCode, otpExpiresAt);
    await this.whatsappSender.sendOtp(normalizado, otpCode);

    return {
      message: 'Código OTP enviado por WhatsApp',
      expira_en_segundos: OTP_TTL_MS / 1000,
    };
  }

  async verifyOtp(telefono: string, codigo: string) {
    const normalizado = this.normalizarTelefono(telefono);
    const user = await this.usuariosService.findByPhoneWithCredentials(
      normalizado,
    );

    const valido = !!user && user.otpCode === codigo;
    const expirado =
      !user?.otpExpiresAt ||
      new Date().getTime() > user.otpExpiresAt.getTime();

    if (!user || !valido || expirado) {
      throw new UnauthorizedException('Código OTP inválido o expirado');
    }

    // Uso único: se limpia el código apenas se valida
    await this.usuariosService.clearOtp(user.id);

    const roles = rolesDeUsuario(user.roles_usuario);
    const payload: JwtPayload = {
      sub: user.id,
      telefono: user.telefono ?? undefined,
      email: user.email ?? undefined,
      roles_usuario: roles,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        telefono: user.telefono,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        roles_usuario: roles,
      },
    };
  }

  async getMe(id: number): Promise<UsuarioResponse> {
    return this.usuariosService.findOne(id);
  }

  async updateMe(
    id: number,
    dto: CompletarPerfilDto,
  ): Promise<UsuarioResponse> {
    const data: Prisma.usuariosUpdateInput = {};

    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.apellido !== undefined) data.apellido = dto.apellido;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.id_genero !== undefined) {
      data.genero = { connect: { id: dto.id_genero } };
    }
    if (dto.fecha_nacimiento !== undefined) {
      data.fecha_nacimiento = new Date(dto.fecha_nacimiento);
    }

    return this.usuariosService.updatePerfil(id, data);
  }

  private normalizarTelefono(telefono: string): string {
    const limpio = telefono.replace(/\s|-/g, '');
    return limpio.startsWith('+') ? limpio : `+${limpio}`;
  }
}