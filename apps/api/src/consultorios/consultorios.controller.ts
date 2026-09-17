import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ConsultoriosService } from "./consultorios.service.js";
import { ConsultorioResponseDto } from "./dto/ConsultorioResponse.dto.js";
import { CrearConsultorioDto } from "./dto/CrearConsultorio.dto.js";
import { ActualizarConsultorioDto } from "./dto/ActualizarConsultorio.dto.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/decorators/role.decorator.js";

@Controller('consultorios')
export class ConsultoriosController {
    constructor(private readonly consultoriosService: ConsultoriosService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(): Promise<ConsultorioResponseDto[]> {
        return this.consultoriosService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ConsultorioResponseDto> {
        return this.consultoriosService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CrearConsultorioDto): Promise<ConsultorioResponseDto> {
        return this.consultoriosService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ActualizarConsultorioDto,
    ): Promise<ConsultorioResponseDto> {
        return this.consultoriosService.update(id, dto);
    }
}