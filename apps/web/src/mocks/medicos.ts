import type { Medico } from '@/models';

/** medicos.Id → referencia directa a usuarios.Id para nombres. */
export const medicosMock: Medico[] = [
  { Id: 11, Id_usuario: 11, Id_Especialidad: 1 }, // Dr. Juan Pérez - Clínica Médica
  { Id: 10, Id_usuario: 10, Id_Especialidad: 2 }, // Dra. Ana Martínez - Cardiología
  { Id: 12, Id_usuario: 12, Id_Especialidad: 3 }, // Dra. Sofía Ruiz - Dermatología
  { Id: 13, Id_usuario: 13, Id_Especialidad: 4 }, // Dr. Pedro Sánchez - Pediatría
  { Id: 14, Id_usuario: 14, Id_Especialidad: 1 }, // Dr. Martín Ferreyra - Clínica Médica
];
