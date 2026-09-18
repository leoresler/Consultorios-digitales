import { IsInt } from "class-validator";

export class AsignarEspecialidadDto {
    @IsInt({ message: 'El ID de especialidad debe ser un numero entero' })
    id_especialidad: number;
}