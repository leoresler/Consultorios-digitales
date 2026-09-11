import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { Usuario } from './interfaces/user.interface.js';
import { UsuarioResponse } from './interfaces/user-response.interface.js';
import * as bcrypt from 'bcrypt';

export const usuarioSelectDefecto: Prisma.usuariosSelect = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  fecha_nacimiento: true,
  id_genero: true,
  roles_usuario: {
    select: {
      roles: {
        select: {
          nombre: true,
        },
      },
    },
  },
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UsuarioResponse[]> {
    return this.prisma.usuarios.findMany({
      select: usuarioSelectDefecto,
    });
  }

  async findOne(id: number): Promise<UsuarioResponse> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      select: usuarioSelectDefecto,
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuarios.findUnique({ where: { email } });
  }

  async create(dto: CrearUsuarioDto): Promise<UsuarioResponse> {
    const { password, contrasena, fecha_nacimiento, ...rest } = dto as any;
    const plainPassword = password || contrasena;

    return this.prisma.usuarios.create({
      data: {
        ...rest,
        fecha_nacimiento: new Date(fecha_nacimiento),
        contrasena: await bcrypt.hash(plainPassword, 10),
      },
      select: usuarioSelectDefecto,
    });
  }

  async update(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioResponse> {
    const { password, contrasena, ...rest } = dto as any;
    const updateData: Prisma.usuariosUpdateInput = { ...rest };

    const plainPassword = password || contrasena;
    if (plainPassword) {
      updateData.contrasena = await bcrypt.hash(plainPassword, 10);
    }

    return this.prisma.usuarios.update({
      where: { id },
      data: updateData,
      select: usuarioSelectDefecto,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.usuarios.delete({
      where: { id },
    });
  }

  async findByPhone(telefono: string): Promise<Usuario | null> {
    return this.prisma.usuarios.findFirst({ where: { telefono } });
  }

  async findOrCreateByPhone(telefono: string, roles_usuario: string = 'PACIENTE'): Promise<any> {
    let usuario = await this.findByPhone(telefono);

    if(!usuario) {
      usuario = await this.prisma.usuarios.create({
        data: {
          telefono,
          roles_usuario,
          isApproved: true,
        },
      });
    }

    return usuario;
  }

  async saveOtp(id: number, otpCode: string, otpExpiresAt: Date): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id },
      data: {
        otpCode,
        otpExpiresAt,
      },
    });
  }

  async clearOtp(id: number): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });
  }
}