import { PartialType } from '@nestjs/mapped-types';
import { CrearUsuarioDto } from './crear-usuario.dto.js'

export class ActualizarUsuarioDto extends PartialType(CrearUsuarioDto) {}