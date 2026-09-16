import { IsDateString, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CompletarPerfilDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsInt()
  id_genero?: number;
}