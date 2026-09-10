import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MedicoResponseDto } from './dto/MedicoResponse.dto.js';
import { CrearMedicoDto } from './dto/CrearMedicoDto.dto.js';
import { MedicoConRelaciones } from './interfaces/medico-con-relaciones.js';

@Injectable()
export class MedicosService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: number): Promise<MedicoResponseDto> {
        // 1. Buscamos en la base de datos incluyendo las relaciones necesarias
        const medico = await this.prisma.medicos.findUnique({
            where: { id },
            include: {
                usuarios: true,
                especialidades: true,
            },
        });

        if (!medico) {
            throw new NotFoundException(`Médico con ID ${id} no encontrado`);
        }

        // 2. Mapeamos el resultado de Prisma a nuestra Clase/Dto de Respuesta limpio
        return {
            id: medico.id,
            usuario: medico.usuarios ? {
                id: medico.usuarios.id,
                nombre: medico.usuarios.nombre, // Asegúrate de que coincida con tus columnas reales de la tabla usuarios
                email: medico.usuarios.email,
            } : undefined,
            especialidad: medico.especialidades ? {
                id: medico.especialidades.id,
                nombre: medico.especialidades.nombre, // Asegúrate de que coincida con tus columnas reales de especialidades
            } : undefined,
        };
    }

    async findAll(): Promise<MedicoResponseDto[]> {
        const medicos = await this.prisma.medicos.findMany({
            include: {
                usuarios: true,
                especialidades: true,
            },
        });

        // Mapeamos cada elemento de la lista
        return medicos.map((medico) => ({
            id: medico.id,
            usuario: medico.usuarios ? {
                id: medico.usuarios.id,
                nombre: medico.usuarios.nombre,
                email: medico.usuarios.email,
            } : undefined,
            especialidad: medico.especialidades ? {
                id: medico.especialidades.id,
                nombre: medico.especialidades.nombre,
            } : undefined,
        }));
    }

    private toResponseDto (medico: MedicoConRelaciones): MedicoResponseDto {
        return {
            id: medico.id,
            usuario: medico.usuarios ? {
                id: medico.usuarios.id,
                nombre: medico.usuarios.nombre,
                email: medico.usuarios.email,
            } : undefined,
            especialidad: medico.especialidades ? {
                id: medico.especialidades.id,
                nombre: medico.especialidades.nombre,
            } : undefined,
        };
    }

    async create(dto: CrearMedicoDto): Promise<MedicoResponseDto> {
        const medico = await this.prisma.medicos.create ({
            data: {
                id_usuario: dto.id_usuario,
                id_especialidad: dto.id_especialidad,
            },
            select: {
                id: true,
                usuarios: { select: { id: true, nombre: true, email: true } },
                especialidades: { select: { id: true, nombre: true} },
            },
        });
        return this.toResponseDto(medico)
    }
}