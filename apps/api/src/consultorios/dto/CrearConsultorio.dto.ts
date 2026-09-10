import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CrearConsultorioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    direccion: string;
}