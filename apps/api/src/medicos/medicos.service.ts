import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { MedicoResponseDto } from './dto/MedicoResponse.dto.js';
import { CrearMedicoDto } from './dto/CrearMedicoDto.dto.js';
import { ActualizarMedicoDto } from './dto/ActualizarMedicoDto.dto.js';
import { AsignarConsultorioDto } from './dto/AsignarConsultorioDto.dto.js';
import { AsignarEspecialidadDto } from './dto/AsignarEspecialidadDto.dto.js';
import { ConsultorioResponseDto } from '../consultorios/dto/ConsultorioResponse.dto.js';
import { EspecialidadResponseDto } from './dto/EspecialidadResponse.dto.js';
import { MedicoConRelaciones } from './interfaces/medico-con-relaciones.js';

@Injectable()
export class MedicosService {
    constructor(private prisma: PrismaService) { }

    private medicosSelect = {
        id: true,
        usuarios: { select: { id: true, nombre: true, email: true } },
        especialidades_medicos: {
            select: {
                especialidades: { select: { id: true, nombre: true } },
            },
        },
        consultorios_medicos: {
            select: {
                consultorios: { select: { id: true, nombre: true, direccion: true } },
            },
        },
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
            especialidades: medico.especialidades_medicos.map((em) => em.especialidades),
            consultorios: medico.consultorios_medicos.map((cm) => cm.consultorios),
            tieneConsultorios: medico._count.consultorios_medicos > 0,
        };
    }

    async create(dto: CrearMedicoDto): Promise<MedicoResponseDto> {
        const medico = await this.prisma.medicos.create({
            data: {
                id_usuario: dto.id_usuario,
                especialidades_medicos: dto.especialidades?.length
                    ? {
                          create: dto.especialidades.map((id_especialidad) => ({
                              especialidades: { connect: { id: id_especialidad } },
                          })),
                      }
                    : undefined,
            },
            select: this.medicosSelect,
        });
        return this.toResponseDto(medico);
    }

    async update(id: number, dto: ActualizarMedicoDto): Promise<MedicoResponseDto> {
        const { especialidades, ...datos } = dto;
        try {
            await this.prisma.$transaction(async (tx) => {
                if (Object.keys(datos).length > 0) {
                    await tx.medicos.update({
                        where: { id },
                        data: datos,
                        select: { id: true },
                    });
                }

                if (especialidades !== undefined) {
                    await tx.especialidades_medicos.deleteMany({
                        where: { id_medico: id },
                    });
                    if (especialidades.length > 0) {
                        await tx.especialidades_medicos.createMany({
                            data: especialidades.map((id_especialidad) => ({
                                id_medico: id,
                                id_especialidad,
                            })),
                            skipDuplicates: true,
                        });
                    }
                }
            });
            return this.findOne(id);
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
            this.prisma.especialidades_medicos.deleteMany({ where: { id_medico: id } }),
            this.prisma.medicos.delete({ where: { id } }),
        ]);
    }

    async addConsultorio(
        idMedico: number,
        dto: AsignarConsultorioDto,
    ): Promise<MedicoResponseDto> {
        const medico = await this.prisma.medicos.findUnique({
            where: { id: idMedico },
            select: { id: true },
        });
        if (!medico) {
            throw new NotFoundException(`Médico con ID ${idMedico} no encontrado`);
        }

        const consultorio = await this.prisma.consultorios.findUnique({
            where: { id: dto.id_consultorio },
            select: { id: true },
        });
        if (!consultorio) {
            throw new NotFoundException(
                `Consultorio con ID ${dto.id_consultorio} no encontrado`,
            );
        }

        await this.prisma.consultorios_medicos.createMany({
            data: { id_medico: idMedico, id_consultorio: dto.id_consultorio },
            skipDuplicates: true,
        });

        return this.findOne(idMedico);
    }

    async removeConsultorio(idMedico: number, idConsultorio: number): Promise<void> {
        const result = await this.prisma.consultorios_medicos.deleteMany({
            where: { id_medico: idMedico, id_consultorio: idConsultorio },
        });

        if (result.count === 0) {
            throw new NotFoundException(
                `El consultorio con ID ${idConsultorio} no está asignado al médico con ID ${idMedico}`,
            );
        }
    }

    async getConsultorios(idMedico: number): Promise<ConsultorioResponseDto[]> {
        const medico = await this.prisma.medicos.findUnique({
            where: { id: idMedico },
            select: { id: true },
        });
        if (!medico) {
            throw new NotFoundException(`Médico con ID ${idMedico} no encontrado`);
        }

        const asignaciones = await this.prisma.consultorios_medicos.findMany({
            where: { id_medico: idMedico },
            select: {
                consultorios: { select: { id: true, nombre: true, direccion: true } },
            },
        });

        return asignaciones.map((asignacion) => asignacion.consultorios);
    }

    async addEspecialidad(
        idMedico: number,
        dto: AsignarEspecialidadDto,
    ): Promise<MedicoResponseDto> {
        const medico = await this.prisma.medicos.findUnique({
            where: { id: idMedico },
            select: { id: true },
        });
        if (!medico) {
            throw new NotFoundException(`Médico con ID ${idMedico} no encontrado`);
        }

        const especialidad = await this.prisma.especialidades.findUnique({
            where: { id: dto.id_especialidad },
            select: { id: true },
        });
        if (!especialidad) {
            throw new NotFoundException(
                `Especialidad con ID ${dto.id_especialidad} no encontrada`,
            );
        }

        await this.prisma.especialidades_medicos.createMany({
            data: { id_medico: idMedico, id_especialidad: dto.id_especialidad },
            skipDuplicates: true,
        });

        return this.findOne(idMedico);
    }

    async removeEspecialidad(idMedico: number, idEspecialidad: number): Promise<void> {
        const result = await this.prisma.especialidades_medicos.deleteMany({
            where: { id_medico: idMedico, id_especialidad: idEspecialidad },
        });

        if (result.count === 0) {
            throw new NotFoundException(
                `La especialidad con ID ${idEspecialidad} no está asignada al médico con ID ${idMedico}`,
            );
        }
    }

    async getEspecialidades(idMedico: number): Promise<EspecialidadResponseDto[]> {
        const medico = await this.prisma.medicos.findUnique({
            where: { id: idMedico },
            select: { id: true },
        });
        if (!medico) {
            throw new NotFoundException(`Médico con ID ${idMedico} no encontrado`);
        }

        const asignaciones = await this.prisma.especialidades_medicos.findMany({
            where: { id_medico: idMedico },
            select: {
                especialidades: { select: { id: true, nombre: true } },
            },
        });

        return asignaciones.map((asignacion) => asignacion.especialidades);
    }
}