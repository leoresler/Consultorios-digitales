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
    const { password, contrasena, ...rest } = dto as any;
    const plainPassword = password || contrasena;

    return this.prisma.usuarios.create({
      data: {
        ...rest,
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
}