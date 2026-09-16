import { IsNotEmpty, Matches } from 'class-validator';

export class SolicitarOtpDto {
  @IsNotEmpty()
  @Matches(/^\+?[0-9]*$/, {
    message: 'El teléfono solo puede contener números y un "+" inicial',
  })
  telefono: string;
}