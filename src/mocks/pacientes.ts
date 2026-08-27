import type { Paciente } from '@/models';

export const pacientesMock: Paciente[] = [
  { Id: 1, Id_usuario: 1, Cobertura: 'OSDE 210' },
  { Id: 2, Id_usuario: 2, Cobertura: 'Swiss Medical' },
  { Id: 3, Id_usuario: 3, Cobertura: 'Galeno' },
  // DISCREPANCIAS #13: sin responsables/tutores en BD; p3 es menor y hoy
  // no hay forma de modelar a su tutor.
  { Id: 4, Id_usuario: 4, Cobertura: 'Particular' },
];
