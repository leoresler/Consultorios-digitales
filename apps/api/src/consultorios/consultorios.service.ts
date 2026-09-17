import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { ConsultorioResponseDto } from "./dto/ConsultorioResponse.dto.js";
import { CrearConsultorioDto } from "./dto/CrearConsultorio.dto.js";
import { ActualizarConsultorioDto } from "./dto/ActualizarConsultorio.dto.js";

@Injectable()
export class ConsultoriosService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: number): Promise<ConsultorioResponseDto> {
        const consultorio = await this.prisma.consultorios.findUnique({
            where: { id },
        });

        if (!consultorio) {
            throw new NotFoundException(`Consultorio con ID ${id} no encontrado`);
        }

        return this.toResponseDto(consultorio);
    }

    async findAll(): Promise<ConsultorioResponseDto[]> {
        const consultorios = await this.prisma.consultorios.findMany();

        return consultorios.map((consultorio) => this.toResponseDto(consultorio));
    }

    private toResponseDto(consultorio: {
        id: number;
        nombre: string;
        direccion: string;
    }): ConsultorioResponseDto {
        return {
            id: consultorio.id,
            nombre: consultorio.nombre,
            direccion: consultorio.direccion,
        };
    }

    async create(dto: CrearConsultorioDto): Promise<ConsultorioResponseDto> {
        const consultorio = await this.prisma.consultorios.create({
            data: dto,
        });

        return this.toResponseDto(consultorio);
    }

    async update(
        id: number,
        dto: ActualizarConsultorioDto,
    ): Promise<ConsultorioResponseDto> {
        try {
            const consultorio = await this.prisma.consultorios.update({
                where: { id },
                data: dto,
            });

            return this.toResponseDto(consultorio);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Consultorio con ID ${id} no encontrado`);
            }
            throw error;
        }
    }
}