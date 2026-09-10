import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ConsultorioResponseDto } from "./dto/ConsultorioResponse.dto.js";
import { MedicoResponseDto } from "../medicos/dto/MedicoResponse.dto.js";

@Injectable() 
export class ConsultoriosService {
    constructor(private prisma: PrismaService) {}

    async findOne(id: number): Promise<ConsultorioResponseDto> {
        const consultorio = await this.prisma.consultorios.findUnique({
            where: { id },
        });

        if(!consultorio) {
            throw new NotFoundException(`Consultorio con ID ${id} no encontrado`);
        }

        return {
            id: consultorio.id,
            nombre: consultorio.nombre,
            direccion: consultorio.direccion
        };
    }

    async findAll(): Promise<MedicoResponseDto[]> {
        const consultorios = await this.prisma.consultorios.findMany();

        return consultorios.map((consultorio) => ({
            id: consultorio.id,
            nombre: consultorio.nombre,
            direccion: consultorio.direccion,
        }));
    }
}