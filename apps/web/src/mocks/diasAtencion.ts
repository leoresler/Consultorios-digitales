import type { DiaAtencion } from '@/models';

/**
 * Tabla `dias_atencion` — fuente de cálculo de slots.
 * Semana de referencia del fixture: lun 2026-08-24 a dom 2026-08-30.
 * Hora_Inicio/Hora_Fin guardan ISO completo (DATETIME según DDL);
 * el slotCalculator usa solo la parte horaria.
 */
export const diasAtencionMock: DiaAtencion[] = [
  { Id: 1, Id_medico: 11, Id_clinica: 1, Dia_Semana: 'Lunes', Hora_Inicio: '2026-08-24T08:00:00', Hora_Fin: '2026-08-24T12:00:00', Duracion_Turno: 30 },
  { Id: 2, Id_medico: 11, Id_clinica: 1, Dia_Semana: 'Miércoles', Hora_Inicio: '2026-08-26T08:00:00', Hora_Fin: '2026-08-26T12:00:00', Duracion_Turno: 30 },
  { Id: 3, Id_medico: 10, Id_clinica: 3, Dia_Semana: 'Martes', Hora_Inicio: '2026-08-25T09:00:00', Hora_Fin: '2026-08-25T13:00:00', Duracion_Turno: 20 },
  { Id: 4, Id_medico: 10, Id_clinica: 3, Dia_Semana: 'Jueves', Hora_Inicio: '2026-08-27T09:00:00', Hora_Fin: '2026-08-27T13:00:00', Duracion_Turno: 20 },
  { Id: 5, Id_medico: 12, Id_clinica: 2, Dia_Semana: 'Lunes', Hora_Inicio: '2026-08-24T14:00:00', Hora_Fin: '2026-08-24T18:00:00', Duracion_Turno: 30 },
  { Id: 6, Id_medico: 13, Id_clinica: 2, Dia_Semana: 'Martes', Hora_Inicio: '2026-08-25T08:00:00', Hora_Fin: '2026-08-25T12:00:00', Duracion_Turno: 20 },
  { Id: 7, Id_medico: 14, Id_clinica: 1, Dia_Semana: 'Jueves', Hora_Inicio: '2026-08-27T15:00:00', Hora_Fin: '2026-08-27T19:00:00', Duracion_Turno: 30 },
  { Id: 8, Id_medico: 14, Id_clinica: 1, Dia_Semana: 'Viernes', Hora_Inicio: '2026-08-28T08:00:00', Hora_Fin: '2026-08-28T12:00:00', Duracion_Turno: 30 },
];
