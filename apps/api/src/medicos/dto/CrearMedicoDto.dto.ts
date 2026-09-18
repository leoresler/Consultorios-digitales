import { IsArray, IsInt, IsOptional } from "class-validator";

export class CrearMedicoDto {
    @IsOptional()
    @IsInt({ message: 'El ID de usuario debe ser un numero entero' })
    id_usuario?: number;

    @IsOptional()
    @IsArray({ message: 'Las especialidades deben ser un array de IDs' })
    @IsInt({ each: true, message: 'Cada ID de especialidad debe ser un numero entero' })
    especialidades?: number[];
}