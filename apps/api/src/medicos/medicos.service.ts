import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { MedicoResponseDto } from './dto/MedicoResponse.dto.js';
import { CrearMedicoDto } from './dto/CrearMedicoDto.dto.js';
import { ActualizarMedicoDto } from './dto/ActualizarMedicoDto.dto.js';
import { MedicoConRelaciones } from './interfaces/medico-con-relaciones.js';

@Injectable()
export class MedicosService {
    constructor(private prisma: PrismaService) { }

    private medicosSelect = {
        id: true,
        usuarios: { select: { id: true, nombre: true, email: true } },
        especialidades: { select: { id: true, nombre: true } },
        _count: { select: { consultorios_medicos: true } },
    } satisfies Prisma.medicosSelect;

    async findOne(id: number): Promise<MedicoResponseDto> {
        // 1. Buscamos en la base de datos incluyendo las relaciones necesarias
        const medico = await this.prisma.medicos.findUnique({
            where: { id },
            select: this.medicosSelect,
        });

        if (!medico) {
            throw new NotFoundException(`Médico con ID ${id} no encontrado`);
        }

        // 2. Mapeamos el resultado de Prisma a nuestra Clase/Dto de Respuesta limpio
        return this.toResponseDto(medico);
    }

    async findAll(): Promise<MedicoResponseDto[]> {
        const medicos = await this.prisma.medicos.findMany({
            select: this.medicosSelect,
        });

        // Mapeamos cada elemento de la lista
        return medicos.map((medico) => this.toResponseDto(medico));
    }

    private toResponseDto(medico: MedicoConRelaciones): MedicoResponseDto {
        return {
            id: medico.id,
            usuario: medico.usuarios ? {
                id: medico.usuarios.id,
                nombre: medico.usuarios.nombre,
                email: medico.usuarios.email ?? undefined,
            } : undefined,
            especialidad: medico.especialidades ? {
                id: medico.especialidades.id,
                nombre: medico.especialidades.nombre,
            } : undefined,
            tieneConsultorios: medico._count.consultorios_medicos > 0,
        };
    }

    async create(dto: CrearMedicoDto): Promise<MedicoResponseDto> {
        const medico = await this.prisma.medicos.create({
            data: {
                id_usuario: dto.id_usuario,
                id_especialidad: dto.id_especialidad,
            },
            select: this.medicosSelect,
        });
        return this.toResponseDto(medico);
    }

    async update(id: number, dto: ActualizarMedicoDto): Promise<MedicoResponseDto> {
        try {
            const medico = await this.prisma.medicos.update({
                where: { id },
                data: dto,
                select: this.medicosSelect,
            });
            return this.toResponseDto(medico);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Médico con ID ${id} no encontrado`);
            }
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        const medico = await this.prisma.medicos.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!medico) {
            throw new NotFoundException(`Médico con ID ${id} no encontrado`);
        }

        await this.prisma.$transaction([
            this.prisma.dias_atencion.deleteMany({ where: { id_medico: id } }),
            this.prisma.consultorios_medicos.deleteMany({ where: { id_medico: id } }),
            this.prisma.medicos.delete({ where: { id } }),
        ]);
    }
}