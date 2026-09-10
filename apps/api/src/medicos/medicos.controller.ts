import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MedicosService } from "./medicos.service.js";
import { MedicoResponseDto } from "./dto/MedicoResponse.dto.js";
import { CrearMedicoDto } from "./dto/CrearMedicoDto.dto.js";

@Controller('medicos') 
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) {}

    @Get()
    findAll(): Promise<MedicoResponseDto[]> {
        return this.medicosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<MedicoResponseDto>{ 
        return this.medicosService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CrearMedicoDto): Promise<MedicoResponseDto> {
        return this.medicosService.create(dto);
    }
}