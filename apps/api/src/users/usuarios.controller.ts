import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { CrearMedicoAdminDto } from './dto/crear-medico-admin.dto.js';
import { AsignarRolesDto } from './dto/asignar-roles.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/role.decorator.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('pendientes') pendientes?: string) {
    return this.usuariosService.findAll(pendientes === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Post('medico')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createMedicoAdmin(@Body() dto: CrearMedicoAdminDto) {
    return this.usuariosService.createMedicoAdmin(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  aprobarMedico(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.aprobarMedico(id);
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  asignarRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarRolesDto,
  ) {
    return this.usuariosService.asignarRoles(id, dto.roles);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.delete(id);
  }
}