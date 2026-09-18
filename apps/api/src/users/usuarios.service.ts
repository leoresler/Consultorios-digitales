import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { CrearMedicoAdminDto } from './dto/crear-medico-admin.dto.js';
import { UsuarioResponse } from './interfaces/user-response.interface.js';
import * as bcrypt from 'bcrypt';

export const usuarioSelectDefecto = Prisma.validator<Prisma.usuariosSelect>()({
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  isApproved: true,
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
});

// Select que incluye credenciales/OTP para flujos de autenticación únicamente
export const usuarioSelectAuth = Prisma.validator<Prisma.usuariosSelect>()({
  ...usuarioSelectDefecto,
  contrasena: true,
  otpCode: true,
  otpExpiresAt: true,
});

// Exportamos el tipo autogenerado para usarlo en el servicio
export type UsuarioConRoles = Prisma.usuariosGetPayload<{
  select: typeof usuarioSelectDefecto;
}>;

export type UsuarioConCredenciales = Prisma.usuariosGetPayload<{
  select: typeof usuarioSelectAuth;
}>;

export function rolesDeUsuario(rol: { roles: { nombre: string } }[]): string[] {
  return rol.map((r) => r.roles.nombre);
}

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private mapearAUsuarioResponse(usuario: UsuarioConRoles): UsuarioResponse {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email ?? '',
      telefono: usuario.telefono ?? '',
      isApproved: usuario.isApproved,
      fecha_nacimiento: usuario.fecha_nacimiento,
      id_genero: usuario.id_genero,
      roles_usuario: rolesDeUsuario(usuario.roles_usuario),
    };
  }

  async findAll(pendientes?: boolean): Promise<UsuarioResponse[]> {
    const usuarios = await this.prisma.usuarios.findMany({
      where: pendientes
        ? {
            isApproved: false,
            roles_usuario: {
              some: { roles: { nombre: 'MEDICO' } },
            },
          }
        : undefined,
      select: usuarioSelectDefecto,
    });

    return usuarios.map((user) => this.mapearAUsuarioResponse(user));
  }

  async findById(id: number): Promise<UsuarioConRoles | null> {
    return this.prisma.usuarios.findUnique({
      where: { id },
      select: usuarioSelectDefecto,
    });
  }

  async findOne(id: number): Promise<UsuarioResponse> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapearAUsuarioResponse(usuario);
  }

  async findByEmail(email: string): Promise<UsuarioResponse | null> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email },
      select: usuarioSelectDefecto,
    });

    if (!usuario) return null;

    return this.mapearAUsuarioResponse(usuario);
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UsuarioConCredenciales | null> {
    return this.prisma.usuarios.findUnique({
      where: { email },
      select: usuarioSelectAuth,
    });
  }

  async findByPhoneWithCredentials(
    telefono: string,
  ): Promise<UsuarioConCredenciales | null> {
    return this.prisma.usuarios.findUnique({
      where: { telefono },
      select: usuarioSelectAuth,
    });
  }

  async create(
    dto: CrearUsuarioDto,
    rolNombre?: string,
  ): Promise<UsuarioResponse> {
    const { password, contrasena, fecha_nacimiento, ...rest } = dto as any;
    const plainPassword = password || contrasena;

    const crear = (tx: Prisma.TransactionClient) =>
      tx.usuarios.create({
        data: {
          ...rest,
          fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
          contrasena: bcrypt.hashSync(plainPassword, 10),
        },
        select: usuarioSelectDefecto, // Trae los datos incluyendo la relación de roles
      });

    let nuevoUsuario: UsuarioConRoles;

    if (rolNombre) {
      nuevoUsuario = await this.prisma.$transaction(async (tx) => {
        const rol = await tx.roles.findFirst({ where: { nombre: rolNombre } });

        if (!rol) {
          throw new NotFoundException(
            `El rol ${rolNombre} no existe en la base de datos.`,
          );
        }

        const usuarioCreado = await crear(tx);

        await tx.roles_usuario.create({
          data: {
            id_usuario: usuarioCreado.id,
            id_roles: rol.id,
          },
        });

        // Refresca la relación de roles para la respuesta
        return tx.usuarios.findUniqueOrThrow({
          where: { id: usuarioCreado.id },
          select: usuarioSelectDefecto,
        });
      });
    } else {
      nuevoUsuario = await crear(this.prisma);
    }

    // Transforma el resultado de Prisma al formato UsuarioResponse
    return this.mapearAUsuarioResponse(nuevoUsuario);
  }

  async update(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioResponse> {
    const { password, contrasena, ...rest } = dto as any;
    const updateData: Prisma.usuariosUpdateInput = { ...rest };

    const plainPassword = password || contrasena;
    if (plainPassword) {
      updateData.contrasena = await bcrypt.hash(plainPassword, 10);
    }

    // 1. Ejecutas la actualización en la BD
    const usuarioActualizado = await this.prisma.usuarios.update({
      where: { id },
      data: updateData,
      select: usuarioSelectDefecto,
    });

    // 2. Mapeas el resultado al formato UsuarioResponse
    return this.mapearAUsuarioResponse(usuarioActualizado);
  }

  async updatePerfil(
    id: number,
    data: Prisma.usuariosUpdateInput,
  ): Promise<UsuarioResponse> {
    const usuario = await this.prisma.usuarios.update({
      where: { id },
      data,
      select: usuarioSelectDefecto,
    });

    return this.mapearAUsuarioResponse(usuario);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.usuarios.delete({
      where: { id },
    });
  }

  async findByPhone(telefono: string): Promise<UsuarioResponse | null> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { telefono },
      select: usuarioSelectDefecto,
    });

    if (!usuario) return null;

    return this.mapearAUsuarioResponse(usuario);
  }

  async findOrCreateByPhone(
    telefono: string,
    rolNombre: string = 'PACIENTE',
  ): Promise<UsuarioResponse> {
    let usuario = await this.findByPhone(telefono);

    if (!usuario) {
      // 1. Buscamos primero el ID del rol 'PACIENTE'
      const rol = await this.prisma.roles.findFirst({
        where: { nombre: rolNombre },
      });

      if (!rol) {
        throw new NotFoundException(
          `El rol ${rolNombre} no existe en la base de datos.`,
        );
      }

      // 2. Creamos el usuario vinculando el rol en la tabla intermedia
      const nuevoUsuario = await this.prisma.usuarios.create({
        data: {
          telefono,
          nombre: 'Paciente', // Campos mínimos obligatorios en tu esquema
          apellido: 'OTP',
          isApproved: true,
          roles_usuario: {
            create: {
              id_roles: rol.id,
            },
          },
        },
        select: usuarioSelectDefecto,
      });

      return this.mapearAUsuarioResponse(nuevoUsuario);
    }

    return usuario;
  }

  async createMedicoAdmin(dto: CrearMedicoAdminDto): Promise<UsuarioResponse> {
    return this.prisma.$transaction(async (tx) => {
      const rol = await tx.roles.findFirst({ where: { nombre: 'MEDICO' } });

      if (!rol) {
        throw new NotFoundException(
          'El rol MEDICO no existe en la base de datos.',
        );
      }

      const usuario = await tx.usuarios.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          email: dto.email,
          telefono: dto.telefono,
          fecha_nacimiento: dto.fecha_nacimiento
            ? new Date(dto.fecha_nacimiento)
            : null,
          id_genero: dto.id_genero,
          contrasena: await bcrypt.hash(dto.password, 10),
          isApproved: false,
          roles_usuario: {
            create: { id_roles: rol.id },
          },
        },
        select: usuarioSelectDefecto,
      });

      await tx.medicos.create({
        data: {
          id_usuario: usuario.id,
          especialidades_medicos: dto.especialidades?.length
            ? {
                create: dto.especialidades.map((id_especialidad) => ({
                  especialidades: { connect: { id: id_especialidad } },
                })),
              }
            : undefined,
        },
      });

      return this.mapearAUsuarioResponse(usuario);
    });
  }

  async aprobarMedico(id: number): Promise<UsuarioResponse> {
    const usuario = await this.prisma.usuarios.update({
      where: { id },
      data: { isApproved: true },
      select: usuarioSelectDefecto,
    });

    return this.mapearAUsuarioResponse(usuario);
  }

  async asignarRoles(id: number, roles: string[]): Promise<UsuarioResponse> {
    return this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.findUnique({ where: { id } });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const rolesEncontrados = await tx.roles.findMany({
        where: { nombre: { in: roles } },
      });

      if (rolesEncontrados.length !== roles.length) {
        const faltantes = roles.filter(
          (nombre) => !rolesEncontrados.some((rol) => rol.nombre === nombre),
        );
        throw new NotFoundException(
          `Roles no encontrados: ${faltantes.join(', ')}`,
        );
      }

      await tx.roles_usuario.createMany({
        data: rolesEncontrados.map((rol) => ({
          id_usuario: id,
          id_roles: rol.id,
        })),
      });

      const actualizado = await tx.usuarios.findUniqueOrThrow({
        where: { id },
        select: usuarioSelectDefecto,
      });

      return this.mapearAUsuarioResponse(actualizado);
    });
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