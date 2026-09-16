import { IsNotEmpty, Matches } from 'class-validator';

export class VerificarOtpDto {
  @IsNotEmpty()
  @Matches(/^\+?[0-9]*$/, {
    message: 'El teléfono solo puede contener números y un "+" inicial',
  })
  telefono: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'El código debe ser numérico de 6 dígitos',
  })
  codigo: string;
}