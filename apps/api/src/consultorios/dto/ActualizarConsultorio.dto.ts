import { PartialType } from "@nestjs/mapped-types";
import { CrearConsultorioDto } from "./CrearConsultorio.dto.js";

export class ActualizarConsultorioDto extends PartialType(CrearConsultorioDto) {}