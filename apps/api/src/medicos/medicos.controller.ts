import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { MedicosService } from "./medicos.service.js";
import { MedicoResponseDto } from "./dto/MedicoResponse.dto.js";
import { CrearMedicoDto } from "./dto/CrearMedicoDto.dto.js";
import { ActualizarMedicoDto } from "./dto/ActualizarMedicoDto.dto.js";
import { AsignarConsultorioDto } from "./dto/AsignarConsultorioDto.dto.js";
import { AsignarEspecialidadDto } from "./dto/AsignarEspecialidadDto.dto.js";
import { ConsultorioResponseDto } from "../consultorios/dto/ConsultorioResponse.dto.js";
import { EspecialidadResponseDto } from "./dto/EspecialidadResponse.dto.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/decorators/role.decorator.js";

@Controller('medicos') 
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(): Promise<MedicoResponseDto[]> {
        return this.medicosService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseIntPipe) id: number): Promise<MedicoResponseDto>{ 
        return this.medicosService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CrearMedicoDto): Promise<MedicoResponseDto> {
        return this.medicosService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ActualizarMedicoDto,
    ): Promise<MedicoResponseDto> {
        return this.medicosService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.medicosService.delete(id);
    }

    @Post(':id/consultorios')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    addConsultorio(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarConsultorioDto,
    ): Promise<MedicoResponseDto> {
        return this.medicosService.addConsultorio(id, dto);
    }

    @Get(':id/consultorios')
    @UseGuards(JwtAuthGuard)
    getConsultorios(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ConsultorioResponseDto[]> {
        return this.medicosService.getConsultorios(id);
    }

    @Delete(':id/consultorios/:idConsultorio')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    removeConsultorio(
        @Param('id', ParseIntPipe) id: number,
        @Param('idConsultorio', ParseIntPipe) idConsultorio: number,
    ): Promise<void> {
        return this.medicosService.removeConsultorio(id, idConsultorio);
    }

    @Post(':id/especialidades')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    addEspecialidad(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarEspecialidadDto,
    ): Promise<MedicoResponseDto> {
        return this.medicosService.addEspecialidad(id, dto);
    }

    @Get(':id/especialidades')
    @UseGuards(JwtAuthGuard)
    getEspecialidades(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<EspecialidadResponseDto[]> {
        return this.medicosService.getEspecialidades(id);
    }

    @Delete(':id/especialidades/:idEspecialidad')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    removeEspecialidad(
        @Param('id', ParseIntPipe) id: number,
        @Param('idEspecialidad', ParseIntPipe) idEspecialidad: number,
    ): Promise<void> {
        return this.medicosService.removeEspecialidad(id, idEspecialidad);
    }
}