import type { FechaHoraISO, HoraHHMM } from '@/types/common';

/**
 * Días laborables según BD. `Dia_Semana` es VARCHAR(10) en el DDL;
 * la unión documenta los valores esperados sin alterar el tipo base.
 */
export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

/**
 * Tabla `dias_atencion` — fuente de verdad para calcular slots.
 *
 * DISCREPANCIAS #16: Hora_Inicio/Hora_Fin son DATETIME (se esperaría TIME
 * recurrente); el frontend usa solo su componente horaria.
 */
export interface DiaAtencion {
  Id: number;
  Id_medico: number;
  /** Referencia a consultorios.Id (columna llamada Id_clinica). */
  Id_clinica: number;
  Dia_Semana: DiaSemana;
  /** DATETIME ISO; se usa la hora. */
  Hora_Inicio: FechaHoraISO;
  Hora_Fin: FechaHoraISO;
  /** Duración del turno en minutos (INT). */
  Duracion_Turno: number;
}

/** VIEW-MODEL: franja horaria normalizada para mostrar en UI. */
export interface RangoHorarioUI {
  Desde: HoraHHMM;
  Hasta: HoraHHMM;
}
