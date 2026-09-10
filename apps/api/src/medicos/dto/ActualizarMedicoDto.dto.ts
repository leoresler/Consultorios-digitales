import { PartialType } from "@nestjs/mapped-types";
import { CrearMedicoDto } from "./CrearMedicoDto.dto.js";

export class ActualizarMedicoDto extends PartialType(CrearMedicoDto) {}