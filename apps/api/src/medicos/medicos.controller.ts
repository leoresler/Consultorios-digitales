import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { MedicosService } from "./medicos.service.js";
import { MedicoResponseDto } from "./dto/MedicoResponse.dto.js";
import { CrearMedicoDto } from "./dto/CrearMedicoDto.dto.js";
import { ActualizarMedicoDto } from "./dto/ActualizarMedicoDto.dto.js";
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
}