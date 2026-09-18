import { IsInt } from "class-validator";

export class AsignarConsultorioDto {
    @IsInt({ message: 'El ID de consultorio debe ser un numero entero' })
    id_consultorio: number;
}