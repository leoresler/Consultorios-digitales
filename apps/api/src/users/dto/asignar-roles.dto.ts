import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AsignarRolesDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe indicar al menos un rol' })
  @IsString({ each: true })
  roles: string[];
}