import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { Usuario } from './interfaces/user.interface';
import { UsuarioResponse } from './interfaces/user-response.interface';
import * as bcrypt from 'bcrypt';

const usuarioSelectDefecto: Prisma.UsuarioSelect = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  telefono: true,
  role: true,
  activo: true,
  createdAt: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UsuarioResponse[]> {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      select: usuarioSelectDefecto,
    })
  }

  async findOne(id: number): Promise<UsuarioResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioSelectDefecto,
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async create(dto: CrearUsuarioDto): Promise<UsuarioResponse> {
    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        telefono: dto.telefono,
        role: 'USER',
        activo: true,
      },
      select: usuarioSelectDefecto,
    });
  }

  async update(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioResponse> {
    const {password, ...rest } = dto;
    const updateData: Prisma.UsuarioUpdateInput = { ...rest };
    if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: usuarioSelectDefecto,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}