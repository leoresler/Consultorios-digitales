import { IsInt, IsOptional } from "class-validator";

export class CrearMedicoDto {
    @IsInt({ message: 'El ID de usuario debe ser un numero entero' })
    id_usuario?: number;

    @IsOptional()
    @IsInt({ message: 'El ID de especialidad debe ser un numero entero' })

    id_especialidad?: number;
}