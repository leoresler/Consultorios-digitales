import type { Turno } from '@/models';

/**
 * Tabla `turnos` — SOLO columnas reales de BD.
 * La hora y el estado son MOCK-ONLY y viven en `turnosExtrasMock`
 * (ver DISCREPANCIAS #1 y #2).
 */
export const turnosMock: Turno[] = [
  { Id: 1, Id_Paciente: 1, Id_Medico: 10, Id_Especialidad: 2, Id_Clinica: 3, Fecha: '2026-08-25' },
  { Id: 2, Id_Paciente: 2, Id_Medico: 11, Id_Especialidad: 1, Id_Clinica: 1, Fecha: '2026-08-26' },
  { Id: 3, Id_Paciente: 1, Id_Medico: 12, Id_Especialidad: 3, Id_Clinica: 2, Fecha: '2026-08-31' },
  { Id: 4, Id_Paciente: 3, Id_Medico: 13, Id_Especialidad: 4, Id_Clinica: 2, Fecha: '2026-08-25' },
  { Id: 5, Id_Paciente: 4, Id_Medico: 11, Id_Especialidad: 1, Id_Clinica: 1, Fecha: '2026-08-24' },
];

/**
 * MOCK-ONLY (#1/#2): hora y estado simulados por turno.Id.
 * Se elimina cuando la BD incorpore las columnas reales.
 */
export const turnosExtrasMock: Record<number, { Hora: string; Estado: 'confirmado' | 'pendiente' | 'cancelado' | 'completado' }> = {
  1: { Hora: '09:40', Estado: 'confirmado' },
  2: { Hora: '08:30', Estado: 'confirmado' },
  3: { Hora: '14:30', Estado: 'pendiente' },
  4: { Hora: '10:20', Estado: 'confirmado' },
  5: { Hora: '11:00', Estado: 'completado' },
};
